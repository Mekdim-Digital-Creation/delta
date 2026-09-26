import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { asyncHandler, HttpError } from '../utils/asyncHandler.js';
import { signToken, requireAuth } from '../middleware/auth.js';
import { store } from '../dependencies.js';

const router = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { name, email, password, phone } = req.body || {};
    if (!name || !email || !password) throw HttpError(400, 'Name, email and password are required');
    if (String(password).length < 6) throw HttpError(400, 'Password must be at least 6 characters');
    if (!EMAIL_RE.test(String(email))) throw HttpError(400, 'Enter a valid email');

    if (await store.users.findByEmail(email)) {
      throw HttpError(409, 'An account with that email already exists');
    }

    const passwordHash = await bcrypt.hash(String(password), 10);
    // New accounts are always customers — admins are provisioned out of band.
    const user = await store.users.create({ name, email, passwordHash, phone, role: 'customer' });

    res.status(201).json({ ok: true, token: signToken(user), user });
  })
);

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) throw HttpError(400, 'Email and password are required');

    const record = await store.users.findByEmail(email);
    // Same message either way so the endpoint can't be used to enumerate accounts.
    if (!record) throw HttpError(401, 'Invalid email or password');

    const match = await bcrypt.compare(String(password), record.password_hash);
    if (!match) throw HttpError(401, 'Invalid email or password');

    const { password_hash, ...user } = record;
    res.json({ ok: true, token: signToken(user), user });
  })
);

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await store.users.findById(req.user.id);
    if (!user) throw HttpError(404, 'User not found');
    res.json({ ok: true, user });
  })
);

export default router;
