import express from 'express';
import asyncHandler from 'express-async-handler';
import Contact from '../models/Contact.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { sendContactNotification } from '../utils/emailService.js';

const router = express.Router();

// Public: submit contact
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { name, email, subject, message } = req.body;
    const saved = await Contact.create({ name, email, subject, message });
    
    // Send email notification
    await sendContactNotification({ name, email, subject, message });
    
    res.status(201).json(saved);
  })
);

// Admin list with filters
router.get(
  '/admin',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { q, status } = req.query;
    const filter = {};
    if (q) filter.$or = [{ name: { $regex: q, $options: 'i' } }, { email: { $regex: q, $options: 'i' } }, { subject: { $regex: q, $options: 'i' } }];
    if (status) filter.status = status;
    const rows = await Contact.find(filter).sort({ createdAt: -1 });
    res.json(rows);
  })
);

// Admin update
router.put(
  '/admin/:id',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const updated = await Contact.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  })
);

// Admin delete
router.delete(
  '/admin/:id',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  })
);

export default router;


