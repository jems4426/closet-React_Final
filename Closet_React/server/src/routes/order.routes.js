import express from 'express';
import asyncHandler from 'express-async-handler';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

const router = express.Router();

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json(orders);
  })
);

router.get(
  '/admin',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { status, q } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (q) filter.$or = [{ paymentIntentId: { $regex: q, $options: 'i' } }, { _id: q }];
    const orders = await Order.find(filter).populate('user', 'name email phone').sort({ createdAt: -1 });
    res.json(orders);
  })
);

router.get(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const order = await Order.findOne({ _id: req.params.id, user: req.userId });
    if (!order) return res.status(404).json({ message: 'Not found' });
    res.json(order);
  })
);

// User: create order
router.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { items, totalAmount, currency = 'inr', status = 'paid', address } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Items required' });
    }
    
    const order = await Order.create({
      user: req.userId,
      items,
      totalAmount,
      currency,
      status,
      address
    });
    
    res.status(201).json(order);
  })
);

// Admin: update order status
router.put(
  '/:id/status',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { status } = req.body; // expected values per schema
    const allowed = ['paid', 'failed', 'cancelled', 'shipped', 'delivered'];
    if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status' });
    const updated = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  })
);

// Admin: create an order manually
router.post(
  '/admin',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { user, items = [], currency = 'inr', status = 'paid', address } = req.body;
    if (!user || !Array.isArray(items) || items.length === 0) return res.status(400).json({ message: 'user and items required' });
    const productIds = items.map(i => i.product);
    const products = await Product.find({ _id: { $in: productIds } });
    const priceById = new Map(products.map(p => [p._id.toString(), p.price]));
    const fullItems = items.map(i => ({ product: i.product, quantity: i.quantity || 1, price: priceById.get(String(i.product)) || 0 }));
    const totalAmount = fullItems.reduce((s, i) => s + i.price * i.quantity, 0);
    const order = await Order.create({ user, items: fullItems, totalAmount, currency, status, address });
    res.status(201).json(order);
  })
);

// Admin: update whole order (except paymentIntentId)
router.put(
  '/admin/:id',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const update = { ...req.body };
    delete update.paymentIntentId;
    const updated = await Order.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  })
);

// Admin: delete order
router.delete(
  '/admin/:id',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  })
);

export default router;


