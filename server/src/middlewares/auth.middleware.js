import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import { asyncHandler } from './error.middleware.js';

/**
 * verifyToken — decodes Bearer JWT, attaches req.user = { userId, role }
 */
export const verifyToken = asyncHandler(async (req, res, next) => {
  const auth = req.headers.authorization;
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Authentication required' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: 'Token invalid or expired' });
  }
});

/**
 * authorizeRole — ensures req.user.role is in the allowed list.
 */
export const authorizeRole =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };

/**
 * requireApprovedOperator — operators must be active (approved by admin).
 * Use AFTER verifyToken + authorizeRole('operator').
 */
export const requireApprovedOperator = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.userId).select('isActive role');
  if (!user) return res.status(404).json({ message: 'Account not found' });
  
  if (user.role === 'admin') return next();
  
  if (user.role !== 'operator') {
    return res.status(403).json({ message: 'Operator account not found' });
  }
  if (!user.isActive) {
    return res.status(403).json({ message: 'Operator account pending approval or suspended' });
  }
  next();
});
