import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { store } from '../dependencies.js';

const router = Router();

router.get(
  '/',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    res.json({ ok: true, stats: await store.stats.summary() });
  })
);

export default router;
