import express from 'express';
import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import mongoose from 'mongoose';
import { upload } from '../utils/upload.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { q, category, mainCategory, subCategory, minPrice, maxPrice, inStock, sort = '-createdAt', limit = 50, page = 1 } = req.query;
    const filter = { isActive: true };
    if (q) filter.title = { $regex: q, $options: 'i' };
    if (category) filter.category = category;
    if (mainCategory) filter.mainCategory = mainCategory;
    if (subCategory) filter.subCategory = subCategory;
    if (minPrice) filter.price = { ...(filter.price || {}), $gte: Number(minPrice) };
    if (maxPrice) filter.price = { ...(filter.price || {}), $lte: Number(maxPrice) };
    if (inStock === 'true') filter.stock = { $gt: 0 };
    const products = await Product.find(filter)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .sort(sort);
    res.json(products);
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Not found' });
    res.json(product);
  })
);

// Check if user can rate this product
router.get(
  '/:id/rating-eligibility',
  requireAuth,
  asyncHandler(async (req, res) => {
    const productId = req.params.id;
    const eligible = await Order.exists({
      user: req.userId,
      status: { $in: ['shipped', 'delivered'] },
      items: { $elemMatch: { product: new mongoose.Types.ObjectId(productId) } }
    });
    res.json({ eligible: Boolean(eligible) });
  })
);

// Submit rating if eligible
router.post(
  '/:id/rate',
  requireAuth,
  asyncHandler(async (req, res) => {
    const productId = req.params.id;
    const { stars, comment } = req.body;
    if (!stars || stars < 1 || stars > 5) return res.status(400).json({ message: 'Stars must be 1-5' });

    const order = await Order.findOne({
      user: req.userId,
      status: { $in: ['shipped', 'delivered'] },
      items: { $elemMatch: { product: productId } }
    });
    if (!order) return res.status(403).json({ message: 'Not eligible to rate' });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const existing = product.ratings.find((r) => r.user.toString() === req.userId);
    if (existing) {
      existing.stars = stars;
      existing.comment = comment;
      existing.createdAt = new Date();
    } else {
      product.ratings.push({ user: req.userId, stars, comment });
      product.numRatings += 1;
    }
    // Recompute average
    const total = product.ratings.reduce((s, r) => s + r.stars, 0);
    product.averageRating = product.ratings.length ? total / product.ratings.length : 0;
    await product.save();
    res.status(201).json({ averageRating: product.averageRating, numRatings: product.numRatings, ratings: product.ratings });
  })
);

router.post(
  '/',
  requireAuth,
  requireAdmin,
  upload.array('images', 8),
  asyncHandler(async (req, res) => {
    const body = req.body;
    const images = (req.files || []).map((f) => `/uploads/photos_products/${f.filename}`);
    const sizes = body.sizes ? (typeof body.sizes === 'string' ? JSON.parse(body.sizes) : body.sizes) : [];
    const isFreeSize = body.subCategory === 'SAREE';
    const stock = isFreeSize ? Number(body.stock) || 0 : sizes.reduce((sum, s) => sum + (Number(s.qty) || 0), 0);
    
    const payload = {
      title: body.title,
      description: body.description,
      price: Number(body.price),
      images,
      mainCategory: body.mainCategory,
      subCategory: body.subCategory,
      category: body.subCategory, // Keep for backward compatibility
      brand: body.brand,
      sizes,
      colors: body.colors ? String(body.colors).split(',').map((s)=>s.trim()).filter(Boolean) : [],
      stock,
      isFreeSize,
      isActive: String(body.isActive) !== 'false'
    };
    const product = await Product.create(payload);
    res.status(201).json(product);
  })
);

router.put(
  '/:id',
  requireAuth,
  requireAdmin,
  upload.array('images', 8),
  asyncHandler(async (req, res) => {
    const body = req.body;
    const update = { ...body };
    if (update.price) update.price = Number(update.price);
    if (update.stock) update.stock = Number(update.stock);
    if (typeof update.isActive !== 'undefined') update.isActive = String(update.isActive) !== 'false';
    if (update.colors && typeof update.colors === 'string') update.colors = update.colors.split(',').map((s)=>s.trim()).filter(Boolean);
    if (update.sizes) {
      if (typeof update.sizes === 'string') {
        update.sizes = JSON.parse(update.sizes);
      }
    }
    // Set isFreeSize based on subCategory
    if (update.subCategory) {
      update.isFreeSize = update.subCategory === 'SAREE';
      update.category = update.subCategory; // Keep backward compatibility
    }
    // Recalculate stock based on subCategory and sizes
    if (update.subCategory === 'SAREE' || (update.isFreeSize && update.stock !== undefined)) {
      // For Sarees, use manual stock
    } else if (update.sizes && update.sizes.length > 0) {
      update.stock = update.sizes.reduce((sum, s) => sum + (Number(s.qty) || 0), 0);
    }
    if (update.isFreeSize !== undefined) update.isFreeSize = Boolean(update.isFreeSize);
    const files = (req.files || []).map((f) => `/uploads/photos_products/${f.filename}`);
    if (files.length) update.images = files;
    const updated = await Product.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  })
);

// Reduce stock after order
router.put(
  '/:id/reduce-stock',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { quantity, size } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    if (product.isFreeSize) {
      product.stock = Math.max(0, product.stock - quantity);
    } else if (size) {
      const sizeObj = product.sizes.find(s => s.size === size);
      if (sizeObj) {
        sizeObj.qty = Math.max(0, sizeObj.qty - quantity);
        product.stock = product.sizes.reduce((sum, s) => sum + s.qty, 0);
      }
    }
    await product.save();
    res.json({ message: 'Stock reduced' });
  })
);

router.delete(
  '/:id',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  })
);

export default router;


