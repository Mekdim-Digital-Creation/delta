import { Router } from 'express';
import { asyncHandler, HttpError } from '../utils/asyncHandler.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { store } from '../dependencies.js';

const router = Router();

const slugify = (s) =>
  String(s)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 120);

const asBool = (v) => !(v === false || v === 0 || v === '0' || v === 'false');

/**
 * Accepts a bundled path (`/products/x.svg`), a root-relative app path, or an
 * absolute http(s) URL. Rejects anything else so a bad admin value can't turn
 * into a `javascript:` URL in the storefront's `src`.
 */
function parseImage(value) {
  const raw = String(value ?? '').trim();
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return raw.slice(0, 500);
  if (/^\/products\/[\w.-]+$/i.test(raw)) return raw;
  throw HttpError(400, 'Image must be a /products/... path or an http(s) URL');
}

/** Normalises + validates the admin-supplied product payload. */
function parseProduct(body) {
  const name = String(body?.name ?? '').trim();
  const category = String(body?.category ?? '').trim();
  if (!name) throw HttpError(400, 'Product name is required');
  if (!category) throw HttpError(400, 'Category is required');

  const price = Number(body.price);
  if (!Number.isFinite(price) || price < 0) throw HttpError(400, 'Price must be a non-negative number');

  const stock = body.stock === undefined || body.stock === '' ? 0 : Number(body.stock);
  if (!Number.isInteger(stock) || stock < 0) throw HttpError(400, 'Stock must be a non-negative integer');

  const minQty = body.min_qty === undefined || body.min_qty === '' ? 1 : Number(body.min_qty);
  if (!Number.isInteger(minQty) || minQty < 1) throw HttpError(400, 'Minimum order must be at least 1');

  return {
    name,
    category,
    price: +price.toFixed(2),
    stock,
    min_qty: minQty,
    description: String(body.description ?? ''),
    unit_label: String(body.unit_label ?? 'piece').trim() || 'piece',
    icon: String(body.icon ?? 'Printer').trim() || 'Printer',
    gradient: body.gradient === 'violet' ? 'violet' : 'cyan',
    image: parseImage(body.image),
    active: asBool(body.active ?? 1),
  };
}

// ── Public list ──────────────────────────────────────────────────────────
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const products = await store.products.list({
      category: req.query.category,
      q: req.query.q,
      // ?all=1 is only reachable by an admin — the panel requests it with a token.
      includeInactive: req.query.all === '1' && req.user?.role === 'admin',
    });
    res.json({ ok: true, products, total: products.length });
  })
);

// ── Categories ───────────────────────────────────────────────────────────
router.get(
  '/categories',
  asyncHandler(async (req, res) => {
    res.json({ ok: true, categories: await store.products.categories() });
  })
);

// ── Single ───────────────────────────────────────────────────────────────
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const product = await store.products.findById(req.params.id);
    if (!product) throw HttpError(404, 'Product not found');
    res.json({ ok: true, product });
  })
);

// ── Create (admin) ───────────────────────────────────────────────────────
router.post(
  '/',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const data = parseProduct(req.body);
    let slug = slugify(req.body.slug || data.name);
    if (await store.products.findBySlug(slug)) slug = `${slug}-${Date.now().toString(36)}`;

    const product = await store.products.create({ ...data, slug });
    res.status(201).json({ ok: true, product });
  })
);

// ── Update (admin) ───────────────────────────────────────────────────────
router.put(
  '/:id',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const current = await store.products.findById(req.params.id);
    if (!current) throw HttpError(404, 'Product not found');

    const merged = { ...current, ...req.body };
    // Toggles from the client may arrive as 0/1 or false/true.
    if (req.body.active !== undefined) merged.active = asBool(req.body.active);

    res.json({ ok: true, product: await store.products.update(current.id, parseProduct(merged)) });
  })
);

// ── Toggle status (admin) ────────────────────────────────────────────────
router.patch(
  '/:id/toggle',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const result = await store.products.toggleActive(req.params.id);
    if (!result) throw HttpError(404, 'Product not found');
    res.json({ ok: true, ...result });
  })
);

// ── Delete (admin) ───────────────────────────────────────────────────────
router.delete(
  '/:id',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const product = await store.products.findById(req.params.id);
    if (!product) throw HttpError(404, 'Product not found');
    await store.products.remove(product.id);
    res.json({ ok: true, id: product.id });
  })
);

export default router;
