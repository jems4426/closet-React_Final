import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.id;
    req.userRole = payload.role;
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

export function requireAdmin(req, res, next) {
  if (req.userRole !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  next();
}

export async function attachUser(req, res, next) {
  if (!req.userId) return next();
  const user = await User.findById(req.userId).select('-passwordHash');
  req.user = user || null;
  next();
}


