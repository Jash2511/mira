import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export function authRequired(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, orgId, role }
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

export async function ensureUserActive(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.status !== 'active') {
      return res.status(403).json({ error: 'Inactive or missing user' });
    }
    next();
  } catch (e) {
    next(e);
  }
}
