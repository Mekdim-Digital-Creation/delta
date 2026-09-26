/**
 * End-to-end smoke test for the API. Runs against the zero-config in-memory
 * driver so it needs no MySQL server:
 *
 *   npm test
 */
process.env.DB_DRIVER = process.env.DB_DRIVER || 'memory';
process.env.MEMORY_DB_FILE = process.env.MEMORY_DB_FILE || './data/test-store.json';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

import fs from 'node:fs';
import path from 'node:path';
import { createApp } from '../src/index.js';
import { seedMemoryStore } from '../src/store/index.js';
import { store } from '../src/dependencies.js';

const ADMIN = { email: 'admin@deltaprint.et', password: 'Admin@123' };
const CUSTOMER = { email: 'demo@deltaprint.et', password: 'Demo@1234' };

let passed = 0;
let failed = 0;

function check(name, condition, detail = '') {
  if (condition) {
    passed += 1;
    console.log(`  ✓ ${name}`);
  } else {
    failed += 1;
    console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

async function run() {
  // Fresh store for every run.
  store.store.data = { users: [], products: [], orders: [], order_items: [], contact_messages: [], seq: {} };
  await seedMemoryStore(store.store);

  const app = createApp();
  const server = app.listen(0);
  await new Promise((r) => server.once('listening', r));
  const base = `http://127.0.0.1:${server.address().port}/api`;

  const call = async (path, { method = 'GET', body, token } = {}) => {
    const res = await fetch(base + path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const data = await res.json().catch(() => null);
    return { status: res.status, data };
  };

  try {
    console.log(`\nDelta Print House — API smoke test (driver: ${store.driver})\n`);

    // ── Health ──────────────────────────────────────────────────────────
    console.log('health');
    const health = await call('/health');
    check('GET /health returns ok', health.status === 200 && health.data.ok === true);

    // ── Catalog ─────────────────────────────────────────────────────────
    console.log('\ncatalog');
    const list = await call('/products');
    check('GET /products returns 12 seeded products', list.data.products?.length === 12,
      `got ${list.data.products?.length}`);
    check('every product has a numeric price', list.data.products.every((p) => typeof p.price !== 'string'));

    const cats = await call('/products/categories');
    check('GET /products/categories returns unique categories',
      Array.isArray(cats.data.categories) && cats.data.categories.length > 0);

    const search = await call('/products?q=mug');
    check('GET /products?q= filters results', search.data.products.length === 1 &&
      search.data.products[0].name === 'Branded Mugs');

    const filtered = await call('/products?category=Banners');
    check('GET /products?category= filters by category',
      filtered.data.products.length === 3 &&
      filtered.data.products.every((p) => p.category === 'Banners'));

    const anonAll = await call('/products?all=1');
    check('?all=1 is ignored for anonymous callers', anonAll.data.products.length === 12);

    // ── Auth ────────────────────────────────────────────────────────────
    console.log('\nauth');
    const badLogin = await call('/auth/login', { method: 'POST', body: { email: ADMIN.email, password: 'wrong' } });
    check('login with wrong password → 401', badLogin.status === 401);

    const admin = await call('/auth/login', { method: 'POST', body: ADMIN });
    check('admin login → 200 + admin role',
      admin.status === 200 && admin.data.user.role === 'admin' && !!admin.data.token);
    const adminToken = admin.data.token;

    const customer = await call('/auth/login', { method: 'POST', body: CUSTOMER });
    check('customer login → 200 + customer role',
      customer.status === 200 && customer.data.user.role === 'customer');
    const customerToken = customer.data.token;

    check('login response never leaks password_hash',
      !JSON.stringify(customer.data).includes('password_hash'));

    const me = await call('/auth/me', { token: customerToken });
    check('GET /auth/me returns the profile', me.status === 200 && me.data.user.email === CUSTOMER.email);

    const noAuth = await call('/auth/me');
    check('GET /auth/me without a token → 401', noAuth.status === 401);

    const dupe = await call('/auth/register', {
      method: 'POST',
      body: { name: 'Dupe', email: CUSTOMER.email, password: 'Test@1234' },
    });
    check('registering an existing email → 409', dupe.status === 409);

    const shortPw = await call('/auth/register', {
      method: 'POST',
      body: { name: 'Short', email: 'short@example.com', password: '123' },
    });
    check('register with a 3-char password → 400', shortPw.status === 400);

    const fresh = await call('/auth/register', {
      method: 'POST',
      body: { name: 'New Person', email: 'new@example.com', password: 'Test@1234' },
    });
    check('register creates a customer account',
      fresh.status === 201 && fresh.data.user.role === 'customer');

    // ── Admin product control ───────────────────────────────────────────
    console.log('\nadmin · product control');
    const created = await call('/products', {
      method: 'POST',
      token: adminToken,
      body: {
        name: 'Foamcore Poster',
        category: 'Posters',
        price: 720,
        stock: 25,
        description: '5mm foamcore board poster, 3mm print + matte lamination.',
        unit_label: 'unit',
        min_qty: 1,
        icon: 'Layers',
        gradient: 'violet',
      },
    });
    check('POST /products creates a product', created.status === 201 && created.data.product.name === 'Foamcore Poster');
    const newId = created.data.product?.id;
    check('new product is active by default', created.data.product?.active === 1);
    check('new product joins the categories list', (await call('/products/categories')).data.categories.includes('Posters'));

    const authAll = await call('/products?all=1', { token: adminToken });
    check('?all=1 is honoured for admins', authAll.data.products.length === 13);

    const forbidden = await call('/products', {
      method: 'POST',
      token: customerToken,
      body: { name: 'Hack', category: 'X', price: 1, stock: 1 },
    });
    check('customer cannot create a product → 403', forbidden.status === 403);

    const badPrice = await call('/products', {
      method: 'POST', token: adminToken,
      body: { name: 'Bad', category: 'X', price: -5, stock: 1 },
    });
    check('negative price → 400', badPrice.status === 400);

    const updated = await call(`/products/${newId}`, {
      method: 'PUT', token: adminToken,
      body: {
        name: 'Foamcore Poster XL', category: 'Posters', price: 900, stock: 12,
        description: 'Extra-thick 10mm foamcore.', active: true,
      },
    });
    check('PUT /products/:id updates fields',
      updated.data.product.name === 'Foamcore Poster XL' &&
      updated.data.product.price === 900 &&
      updated.data.product.stock === 12 &&
      updated.data.product.description === 'Extra-thick 10mm foamcore.');

    const toggled = await call(`/products/${newId}/toggle`, { method: 'PATCH', token: adminToken });
    check('PATCH toggle flips active → false', toggled.data.active === false);
    check('de-listed product leaves the public catalog',
      !(await call('/products')).data.products.some((p) => p.id === newId));
    await call(`/products/${newId}/toggle`, { method: 'PATCH', token: adminToken });

    const missing = await call('/products/999999', { method: 'PUT', token: adminToken, body: { name: 'x' } });
    check('PUT on a missing product → 404', missing.status === 404);

    // ── Orders ──────────────────────────────────────────────────────────
    console.log('\norders');
    const stockBefore = (await call('/products')).data.products.find((p) => p.name === 'Branded Mugs').stock;

    const noAuthOrder = await call('/orders', { method: 'POST', body: {} });
    check('POST /orders without a token → 401', noAuthOrder.status === 401);

    const emptyCart = await call('/orders', {
      method: 'POST', token: customerToken,
      body: { items: [], customer: { name: 'A', email: 'a@b.c', phone: '1', address: 'x' }, paymentMethod: 'cod' },
    });
    check('POST /orders with an empty cart → 400', emptyCart.status === 400);

    const badMethod = await call('/orders', {
      method: 'POST', token: customerToken,
      body: {
        items: [{ productId: 6, qty: 1 }],
        customer: { name: 'A', email: 'a@b.c', phone: '1', address: 'x' },
        paymentMethod: 'bitcoin',
      },
    });
    check('unsupported payment method → 400', badMethod.status === 400);

    const tooMany = await call('/orders', {
      method: 'POST', token: customerToken,
      body: {
        items: [{ productId: 6, qty: 999999 }],
        customer: { name: 'A', email: 'a@b.c', phone: '1', address: 'x' },
        paymentMethod: 'cod',
      },
    });
    check('ordering more than available stock → 400', tooMany.status === 400);

    const order = await call('/orders', {
      method: 'POST',
      token: customerToken,
      body: {
        items: [{ productId: 6, qty: 5 }, { productId: 1, qty: 2 }],
        // Deliberately lie about the price — the server must re-price.
        customer: { name: 'Abebe Kebede', email: CUSTOMER.email, phone: '+251911000002', address: 'Bole Road', city: 'Addis Ababa' },
        paymentMethod: 'telebirr',
      },
    });
    check('POST /orders creates an order', order.status === 201 && /^DTH-/.test(order.data.order.order_no));
    check('order response echoes the payment method', order.data.order.payment_method === 'telebirr');

    const mugs = (await call('/products')).data.products.find((p) => p.name === 'Branded Mugs');
    const cards = (await call('/products')).data.products.find((p) => p.name === 'Premium Business Cards');
    const expectedTotal = mugs.price * 5 + cards.price * 2;
    check('total is re-priced server-side from the database',
      Math.abs(order.data.order.total - expectedTotal) < 0.01,
      `got ${order.data.order.total}, expected ${expectedTotal}`);

    const stockAfter = (await call('/products')).data.products.find((p) => p.name === 'Branded Mugs').stock;
    check('stock is decremented by the ordered quantity', stockAfter === stockBefore - 5,
      `${stockBefore} → ${stockAfter}`);

    const mine = await call('/orders/mine', { token: customerToken });
    check('GET /orders/mine includes the new order',
      mine.data.orders.some((o) => o.order_no === order.data.order.order_no));
    check('customer history carries line items',
      mine.data.orders.find((o) => o.order_no === order.data.order.order_no)?.items?.length === 2);

    const adminOrders = await call('/orders', { token: adminToken });
    check('admin sees all orders', adminOrders.data.orders.length === 7);
    check('admin orders carry their line items',
      adminOrders.data.orders.find((o) => o.order_no === order.data.order.order_no)?.items?.length === 2);

    const custOrders = await call('/orders', { token: customerToken });
    check('customer cannot list all orders → 403', custOrders.status === 403);

    const orderId = order.data.order.id;

    const badStatus = await call(`/orders/${orderId}/status`, {
      method: 'PATCH', token: adminToken, body: { status: 'teleported' },
    });
    check('invalid fulfillment status → 400', badStatus.status === 400);

    const advanced = await call(`/orders/${orderId}/status`, {
      method: 'PATCH', token: adminToken, body: { status: 'in_production' },
    });
    check('PATCH status moves the order to in_production', advanced.data.order.status === 'in_production');

    await call(`/orders/${orderId}/status`, { method: 'PATCH', token: adminToken, body: { status: 'cancelled' } });
    const restocked = (await call('/products')).data.products.find((p) => p.name === 'Branded Mugs');
    check('cancelling an order restocks its items', restocked.stock === stockBefore,
      `${stockAfter} → ${restocked.stock} (expected ${stockBefore})`);

    // ── Stats ───────────────────────────────────────────────────────────
    console.log('\nanalytics');
    // Re-read: the order we created has since been cancelled, so the live
    // total used as the baseline must be captured after that transition.
    const ordersNow = (await call('/orders', { token: adminToken })).data.orders;
    const sumOfLiveOrderTotals = +ordersNow
      .filter((o) => o.status !== 'cancelled')
      .reduce((a, o) => a + Number(o.total), 0)
      .toFixed(2);

    const statsDenied = await call('/stats', { token: customerToken });
    check('customer cannot read stats → 403', statsDenied.status === 403);

    const stats = await call('/stats', { token: adminToken });
    const s = stats.data.stats;
    check('stats returns the dashboard payload',
      stats.status === 200 && typeof s.revenue === 'number' && Array.isArray(s.byMethod));
    check('revenue is numeric (DECIMAL coerced)', typeof s.revenue === 'number' && !Number.isNaN(s.revenue));
    check('all 7 orders counted, cancelled ones included in the total',
      s.totalOrders === 7 && s.pendingOrders === 1,
      `orders=${s.totalOrders} pending=${s.pendingOrders}`);
    check('revenue excludes the cancelled order',
      Math.abs(s.revenue - sumOfLiveOrderTotals) < 0.01,
      `revenue=${s.revenue}`);
    check('inventory counters present',
      s.totalProducts === 13 && s.activeProducts === 13 && s.lowStock === 2,
      `total=${s.totalProducts} active=${s.activeProducts} low=${s.lowStock}`);
    check('payment breakdown covers all three rails', s.byMethod.length === 3);
    check('category breakdown is populated', s.byCategory.length > 0);
    check('14-day trend is present', Array.isArray(s.last14) && s.last14.length > 0);

    // ── Cleanup of the created product ──────────────────────────────────
    const removed = await call(`/products/${newId}`, { method: 'DELETE', token: adminToken });
    check('DELETE /products/:id removes the product', removed.status === 200);
    check('deleted product is gone', (await call('/products?all=1', { token: adminToken })).data.products.length === 12);

    const goneDelete = await call(`/products/${newId}`, { method: 'DELETE', token: adminToken });
    check('deleting a missing product → 404', goneDelete.status === 404);

    // ── Contact form ────────────────────────────────────────────────────
    console.log('\ncontact');
    const badEmail = await call('/contact', {
      method: 'POST',
      body: { name: 'A', email: 'not-an-email', subject: 'Quote please', message: 'Hello there friend' },
    });
    check('invalid email → 400', badEmail.status === 400);

    const shortMessage = await call('/contact', {
      method: 'POST',
      body: { name: 'A B', email: 'a@b.et', subject: 'Quote please', message: 'hi' },
    });
    check('message under 10 chars → 400', shortMessage.status === 400);

    const sent = await call('/contact', {
      method: 'POST',
      body: {
        name: 'Sara Bekele',
        email: 'sara@example.et',
        phone: '+251911333444',
        subject: 'Quote for 2000 flyers',
        message: 'I need 2000 A5 double-sided flyers delivered by next Friday.',
      },
    });
    check('contact form accepts a valid message', sent.status === 201 && sent.data.message.id > 0);
    check('contact response does not echo the stored row', !sent.data.message.message);

    const custInbox = await call('/contact', { token: customerToken });
    check('customer cannot read the inbox → 403', custInbox.status === 403);

    const inbox = await call('/contact', { token: adminToken });
    check('admin inbox lists the message',
      inbox.status === 200 && inbox.data.messages.some((m) => m.email === 'sara@example.et'));
    check('new messages default to status "new"', inbox.data.messages[0].status === 'new');

    const msgId = inbox.data.messages.find((m) => m.email === 'sara@example.et').id;
    const marked = await call(`/contact/${msgId}/status`, {
      method: 'PATCH', token: adminToken, body: { status: 'replied' },
    });
    check('PATCH message status works', marked.data.message.status === 'replied');

    const badMsgStatus = await call(`/contact/${msgId}/status`, {
      method: 'PATCH', token: adminToken, body: { status: 'archived' },
    });
    check('invalid message status → 400', badMsgStatus.status === 400);

    const delMsg = await call(`/contact/${msgId}`, { method: 'DELETE', token: adminToken });
    check('admin can delete a message', delMsg.status === 200);
    const delAgain = await call(`/contact/${msgId}`, { method: 'DELETE', token: adminToken });
    check('deleting a missing message → 404', delAgain.status === 404);

    // ── Product images ──────────────────────────────────────────────────
    console.log('\nproduct images');
    const withImage = await call('/products');
    check('seeded products expose an image path',
      withImage.data.products.every((p) => p.image && p.image.startsWith('/products/')));

    const badImage = await call('/products', {
      method: 'POST', token: adminToken,
      body: { name: 'XSS', category: 'X', price: 1, stock: 1, image: 'javascript:alert(1)' },
    });
    check('javascript: image URL rejected → 400', badImage.status === 400);

    const goodImage = await call('/products', {
      method: 'POST', token: adminToken,
      body: { name: 'Remote Image', category: 'X', price: 1, stock: 1, image: '/products/mugs.svg' },
    });
    check('a /products/ image path is accepted', goodImage.data.product?.image === '/products/mugs.svg');
    await call(`/products/${goodImage.data.product.id}`, { method: 'DELETE', token: adminToken });

    // ── 404 handling ────────────────────────────────────────────────────
    const notFound = await call('/nope');
    check('unknown route → 404 JSON', notFound.status === 404 && notFound.data.ok === false);
  } finally {
    server.close();
    const file = path.resolve(process.env.MEMORY_DB_FILE);
    if (fs.existsSync(file)) fs.unlinkSync(file);
  }

  console.log(`\n${passed} passed, ${failed} failed\n`);
  process.exit(failed ? 1 : 0);
}

run().catch((err) => {
  console.error('\nSmoke test crashed:', err);
  process.exit(1);
});
