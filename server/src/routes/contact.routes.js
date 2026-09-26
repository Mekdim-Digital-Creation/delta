import { Router } from 'express';
import { asyncHandler, HttpError } from '../utils/asyncHandler.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { store } from '../dependencies.js';

const router = Router();

const STATUSES = new Set(['new', 'read', 'replied']);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Naive per-IP throttle so the public form can't be used to flood the inbox.
const recent = new Map();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;

function throttle(ip) {
  const now = Date.now();
  const hits = (recent.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (hits.length >= MAX_PER_WINDOW) {
    throw HttpError(429, 'Too many messages sent. Please try again shortly.');
  }
  hits.push(now);
  recent.set(ip, hits);
}

/** POST /api/contact — public contact form */
router.post(
  '/',
  asyncHandler(async (req, res) => {
    throttle(req.ip || 'anon');

    const name = String(req.body?.name ?? '').trim();
    const email = String(req.body?.email ?? '').trim();
    const phone = String(req.body?.phone ?? '').trim();
    const subject = String(req.body?.subject ?? '').trim();
    const message = String(req.body?.message ?? '').trim();

    if (name.length < 2 || name.length > 120) throw HttpError(400, 'Please enter your name');
    if (!EMAIL_RE.test(email) || email.length > 190) throw HttpError(400, 'Please enter a valid email address');
    if (subject.length < 3 || subject.length > 160) throw HttpError(400, 'Please add a subject');
    if (message.length < 10 || message.length > 4000) {
      throw HttpError(400, 'Message must be between 10 and 4000 characters');
    }

    const saved = await store.messages.create({ name, email, phone, subject, message });
    res.status(201).json({
      ok: true,
      // Don't echo the stored row back — only what the sender needs.
      message: { id: saved.id, subject: saved.subject, created_at: saved.created_at },
    });
  })
);

/** GET /api/contact — admin inbox */
router.get(
  '/',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const status = STATUSES.has(req.query.status) ? req.query.status : undefined;
    const messages = await store.messages.list({ status });
    res.json({ ok: true, messages, total: messages.length });
  })
);

/** PATCH /api/contact/:id/status — mark read / replied */
router.patch(
  '/:id/status',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { status } = req.body || {};
    if (!STATUSES.has(status)) throw HttpError(400, 'Invalid message status');
    const updated = await store.messages.setStatus(req.params.id, status);
    if (!updated) throw HttpError(404, 'Message not found');
    res.json({ ok: true, message: updated });
  })
);

/** DELETE /api/contact/:id */
router.delete(
  '/:id',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const existing = await store.messages.findById(req.params.id);
    if (!existing) throw HttpError(404, 'Message not found');
    await store.messages.remove(req.params.id);
    res.json({ ok: true });
  })
);

export default router;
