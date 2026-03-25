import express from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import { sendVerificationCode } from '../utils/emailService.js';

const router = express.Router();

// Store verification codes temporarily (in production, use Redis)
const verificationCodes = new Map();

// Generate 6-digit code
const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send verification code
router.post('/send-code', asyncHandler(async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  // Check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Generate and store code
  const code = generateCode();
  verificationCodes.set(email, {
    code,
    expires: Date.now() + 10 * 60 * 1000, // 10 minutes
    attempts: 0
  });

  // Send email
  const emailResult = await sendVerificationCode(email, code, user.name);
  
  if (emailResult.success) {
    res.json({ message: 'Verification code sent successfully' });
  } else {
    res.status(500).json({ message: 'Failed to send email', error: emailResult.error });
  }
}));

// Verify code
router.post('/verify-code', asyncHandler(async (req, res) => {
  const { email, code } = req.body;
  
  if (!email || !code) {
    return res.status(400).json({ message: 'Email and code are required' });
  }

  const storedData = verificationCodes.get(email);
  
  if (!storedData) {
    return res.status(400).json({ message: 'No verification code found' });
  }

  if (Date.now() > storedData.expires) {
    verificationCodes.delete(email);
    return res.status(400).json({ message: 'Verification code expired' });
  }

  if (storedData.attempts >= 3) {
    verificationCodes.delete(email);
    return res.status(400).json({ message: 'Too many attempts' });
  }

  if (storedData.code !== code) {
    storedData.attempts++;
    return res.status(400).json({ message: 'Invalid verification code' });
  }

  // Mark as verified
  storedData.verified = true;
  res.json({ message: 'Code verified successfully' });
}));

// Reset password
router.post('/reset-password', asyncHandler(async (req, res) => {
  const { email, newPassword } = req.body;
  
  if (!email || !newPassword) {
    return res.status(400).json({ message: 'Email and new password are required' });
  }

  const storedData = verificationCodes.get(email);
  
  if (!storedData || !storedData.verified) {
    return res.status(400).json({ message: 'Email not verified' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  // Update password
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  user.passwordHash = await User.hashPassword(newPassword);
  await user.save();

  // Clean up
  verificationCodes.delete(email);

  res.json({ message: 'Password reset successfully' });
}));

export default router;