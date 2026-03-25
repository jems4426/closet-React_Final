import express from 'express';
import asyncHandler from 'express-async-handler';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { upload } from '../utils/upload.js';
import User from '../models/User.js';
import Product from '../models/Product.js';

const router = express.Router();

// Self: update profile
router.put(
  '/me',
  requireAuth,
  upload.single('profilePicture'),
  asyncHandler(async (req, res) => {
    const { name, phone } = req.body;
    const update = { name, phone };
    if (req.file) {
      update.profilePicture = `/uploads/photos_user/${req.file.filename}`;
    }
    const user = await User.findByIdAndUpdate(req.userId, update, { new: true }).select('-passwordHash');
    res.json(user);
  })
);

// Admin: list users with filters
router.get(
  '/admin/users',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { q, role } = req.query;
    const filter = {};
    if (q) filter.$or = [{ name: { $regex: q, $options: 'i' } }, { email: { $regex: q, $options: 'i' } }];
    if (role) filter.role = role;
    const users = await User.find(filter).select('-passwordHash').sort({ createdAt: -1 });
    res.json(users);
  })
);

// Admin: create user
router.post(
  '/admin/users',
  requireAuth,
  requireAdmin,
  upload.single('profilePicture'),
  asyncHandler(async (req, res) => {
    const { name, email, password, role = 'user', phone } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Email already exists' });
    const passwordHash = await User.hashPassword(password || Math.random().toString(36));
    const profilePicture = req.file ? `/uploads/photos_user/${req.file.filename}` : undefined;
    const user = await User.create({ name, email, passwordHash, role, phone, profilePicture });
    res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, profilePicture: user.profilePicture });
  })
);

// Admin: update user
router.put(
  '/admin/users/:id',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { name, email, role, phone, profilePicture, password } = req.body;
    const update = { name, email, role, phone, profilePicture };
    if (password) update.passwordHash = await User.hashPassword(password);
    const updated = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('-passwordHash');
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  })
);

// Admin: delete user
router.delete(
  '/admin/users/:id',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  })
);

// Cart endpoints
router.get(
  '/cart',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.userId).populate('cart.product');
    res.json(user.cart);
  })
);

router.post(
  '/cart',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { productId, quantity = 1 } = req.body;
    const user = await User.findById(req.userId);
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    const existing = user.cart.find((c) => c.product.toString() === productId);
    if (existing) existing.quantity += Number(quantity);
    else user.cart.push({ product: productId, quantity });
    await user.save();
    const populated = await user.populate('cart.product');
    res.status(201).json(populated.cart);
  })
);

router.put(
  '/cart/:productId',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { quantity } = req.body;
    const user = await User.findById(req.userId);
    const item = user.cart.find((c) => c.product.toString() === req.params.productId);
    if (!item) return res.status(404).json({ message: 'Item not in cart' });
    item.quantity = Number(quantity);
    await user.save();
    const populated = await user.populate('cart.product');
    res.json(populated.cart);
  })
);

router.delete(
  '/cart/:productId',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.userId);
    user.cart = user.cart.filter((c) => c.product.toString() !== req.params.productId);
    await user.save();
    const populated = await user.populate('cart.product');
    res.json(populated.cart);
  })
);

// Wishlist endpoints
router.get(
  '/wishlist',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.userId).populate('wishlist');
    res.json(user.wishlist);
  })
);

router.post(
  '/wishlist',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { productId } = req.body;
    const user = await User.findById(req.userId);
    const exists = user.wishlist.some((id) => id.toString() === productId);
    if (!exists) user.wishlist.push(productId);
    await user.save();
    const populated = await user.populate('wishlist');
    res.status(201).json(populated.wishlist);
  })
);

router.delete(
  '/wishlist/:productId',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.userId);
    user.wishlist = user.wishlist.filter((id) => id.toString() !== req.params.productId);
    await user.save();
    const populated = await user.populate('wishlist');
    res.json(populated.wishlist);
  })
);

// Address management
router.get('/addresses', requireAuth, asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId).select('addresses');
  res.json(user.addresses || []);
}));

router.post('/addresses', requireAuth, asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);
  if (req.body.isDefault) {
    user.addresses.forEach(addr => addr.isDefault = false);
  }
  user.addresses.push(req.body);
  await user.save();
  res.status(201).json(user.addresses[user.addresses.length - 1]);
}));

router.put('/addresses/:addressId', requireAuth, asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);
  const address = user.addresses.id(req.params.addressId);
  if (!address) return res.status(404).json({ message: 'Address not found' });
  if (req.body.isDefault) {
    user.addresses.forEach(addr => addr.isDefault = false);
  }
  Object.assign(address, req.body);
  await user.save();
  res.json(address);
}));

router.delete('/addresses/:addressId', requireAuth, asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);
  user.addresses.id(req.params.addressId).remove();
  await user.save();
  res.json({ message: 'Address deleted' });
}));

export default router;


