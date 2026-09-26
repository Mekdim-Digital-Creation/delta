import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { HttpError } from '../utils/asyncHandler.js';

export function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    env.jwt.secret,
    { expiresIn: env.jwt.expiresIn }
  );
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next(HttpError(401, 'Authentication required'));
  try {
    req.user = jwt.verify(token, env.jwt.secret);
    next();
  } catch {
    next(HttpError(401, 'Invalid or expired token'));
  }
}

/** Populates `req.user` when a valid token is present, but never rejects. */
export function optionalAuth(req, res, next) {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) {
    try {
      req.user = jwt.verify(header.slice(7), env.jwt.secret);
    } catch {
      /* ignore — treated as anonymous */
    }
  }
  next();
}

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return next(HttpError(403, 'Administrator access required'));
  }
  next();
}
