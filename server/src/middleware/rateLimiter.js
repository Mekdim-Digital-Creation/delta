import { env } from '../config/env.js';

/** Minimal fixed-window rate limiter (no external dependency). */
const hits = new Map();

export default function rateLimit({ windowMs = env.rateLimit.windowMs, max = env.rateLimit.max } = {}) {
  return (req, res, next) => {
    const key = req.ip || 'anon';
    const now = Date.now();
    const entry = hits.get(key);

    if (!entry || now - entry.start > windowMs) {
      hits.set(key, { start: now, count: 1 });
      // Opportunistic sweep so the map can't grow without bound.
      if (hits.size > 5000) {
        for (const [k, v] of hits) if (now - v.start > windowMs) hits.delete(k);
      }
      return next();
    }

    entry.count += 1;
    if (entry.count > max) {
      return res.status(429).json({ ok: false, error: 'Too many requests, slow down.' });
    }
    next();
  };
}
