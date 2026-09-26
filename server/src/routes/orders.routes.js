import { Router } from 'express';
import { asyncHandler, HttpError } from '../utils/asyncHandler.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { store } from '../dependencies.js';

const router = Router();

const PAYMENT_METHODS = new Set(['telebirr', 'cbe_birr', 'cod']);
const STATUSES = new Set(['pending', 'in_production', 'ready', 'delivered', 'cancelled']);

const genOrderNo = () =>
  `DTH-${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 90 + 10)}`;

/**
 * POST /api/orders
 * Creates an order + line items in a single transaction.
 * Requires auth so orders are always tied to a real customer account.
 */
router.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { items, customer, paymentMethod, notes } = req.body || {};

    if (!Array.isArray(items) || items.length === 0) throw HttpError(400, 'Your cart is empty');
    if (!customer?.name || !customer?.email || !customer?.phone || !customer?.address) {
      throw HttpError(400, 'Customer name, email, phone and address are required');
    }
    if (!PAYMENT_METHODS.has(paymentMethod)) throw HttpError(400, 'Unsupported payment method');

    // Re-price server-side from the store — never trust client totals.
    const ids = [...new Set(items.map((i) => Number(i.productId)).filter(Boolean))];
    if (!ids.length) throw HttpError(400, 'Invalid cart items');
    const products = await store.products.findManyByIds(ids);
    const byId = new Map(products.map((p) => [p.id, p]));

    const lines = [];
    let total = 0;
    for (const item of items) {
      const product = byId.get(Number(item.productId));
      if (!product || product.active !== 1) {
        throw HttpError(400, 'A product in your cart is no longer available');
      }
      const qty = Math.max(1, Math.floor(Number(item.qty) || 1));
      if (product.stock < qty) throw HttpError(400, `Insufficient stock for "${product.name}"`);

      const unitPrice = Number(product.price);
      const subtotal = +(unitPrice * qty).toFixed(2);
      total += subtotal;
      lines.push({ product, qty, unitPrice, subtotal });
    }

    const order = await store.orders.create({
      orderNo: genOrderNo(),
      userId: req.user.id,
      customer,
      paymentMethod,
      notes,
      total: +total.toFixed(2),
      lines,
    });

    res.status(201).json({ ok: true, order });
  })
);

/** GET /api/orders/mine — the signed-in customer's order history */
router.get(
  '/mine',
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json({ ok: true, orders: await store.orders.listForUser(req.user.id) });
  })
);

/** GET /api/orders — admin list with embedded line items */
router.get(
  '/',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const status = STATUSES.has(req.query.status) ? req.query.status : undefined;
    const orders = await store.orders.listAll({ status });
    res.json({ ok: true, orders, total: orders.length });
  })
);

/** PATCH /api/orders/:id/status — admin fulfillment workflow */
router.patch(
  '/:id/status',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { status } = req.body || {};
    if (!STATUSES.has(status)) throw HttpError(400, 'Invalid fulfillment status');

    const order = await store.orders.setStatus(req.params.id, status);
    if (!order) throw HttpError(404, 'Order not found');
    res.json({ ok: true, order });
  })
);

export default router;
