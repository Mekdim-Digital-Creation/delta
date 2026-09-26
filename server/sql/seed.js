import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';

import { env } from '../src/config/env.js';
import { PRODUCTS, DEMO_ADMIN, DEMO_CUSTOMER, DEMO_ORDERS } from '../src/store/seedData.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const conn = await mysql.createConnection({
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    multipleStatements: true,
    charset: 'utf8mb4_unicode_ci',
  });

  console.log('→ Applying schema...');
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await conn.query(schema);
  console.log(`✓ Schema applied (${env.db.database})`);

  await conn.query(`USE \`${env.db.database}\``);

  // ── Admin + demo customer ──────────────────────────────────────────────
  const adminHash = await bcrypt.hash(DEMO_ADMIN.password, 10);
  const custHash = await bcrypt.hash(DEMO_CUSTOMER.password, 10);

  for (const account of [DEMO_ADMIN, DEMO_CUSTOMER]) {
    await conn.query(
      `INSERT INTO users (name, email, password_hash, role, phone)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE name = VALUES(name), role = VALUES(role), phone = VALUES(phone)`,
      [account.name, account.email, account.role === 'admin' ? adminHash : custHash, account.role, account.phone]
    );
  }
  console.log(`✓ Users ready → ${DEMO_ADMIN.email} / ${DEMO_ADMIN.password}  ·  ${DEMO_CUSTOMER.email} / ${DEMO_CUSTOMER.password}`);

  // ── Products ───────────────────────────────────────────────────────────
  for (const p of PRODUCTS) {
    await conn.query(
      `INSERT INTO products (name, slug, description, category, price, stock, unit_label, min_qty, icon, gradient, image, active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description),
         category = VALUES(category), price = VALUES(price), stock = VALUES(stock),
         unit_label = VALUES(unit_label), min_qty = VALUES(min_qty),
         icon = VALUES(icon), gradient = VALUES(gradient), image = VALUES(image)`,
      [p.name, p.slug, p.description, p.category, p.price, p.stock, p.unit_label, p.min_qty, p.icon, p.gradient, p.image, p.active]
    );
  }
  console.log(`✓ ${PRODUCTS.length} products ready`);

  // ── Demo orders (only on a fresh database) ─────────────────────────────
  const [[{ c: orderCount }]] = await conn.query('SELECT COUNT(*) AS c FROM orders');
  if (Number(orderCount) === 0) {
    const [cust] = await conn.query('SELECT id, name, email FROM users WHERE email = ?', [
      DEMO_CUSTOMER.email,
    ]);
    const [procs] = await conn.query('SELECT id, name, price FROM products ORDER BY id LIMIT 9');

    for (const [i, demo] of DEMO_ORDERS.entries()) {
      const lines = demo.lines
        .map((idx) => procs[idx])
        .filter(Boolean)
        .map((product, j) => ({ product, qty: 2 + ((i + j) % 4) }));
      const total = +lines.reduce((acc, l) => acc + l.product.price * l.qty, 0).toFixed(2);

      const [res] = await conn.query(
        `INSERT INTO orders (order_no, user_id, customer_name, customer_email, customer_phone,
           address, city, payment_method, status, total, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, DATE_SUB(NOW(), INTERVAL ? DAY), DATE_SUB(NOW(), INTERVAL ? DAY))`,
        [
          `DTH-SEED${100 + i}`,
          cust[0].id,
          cust[0].name,
          cust[0].email,
          DEMO_CUSTOMER.phone,
          'Bole Road, Behind Getu Commercial Center',
          'Addis Ababa',
          demo.method,
          demo.status,
          total,
          demo.daysAgo,
          demo.daysAgo,
        ]
      );

      await conn.query(
        `INSERT INTO order_items (order_id, product_id, product_name, unit_price, qty, subtotal) VALUES ?`,
        [lines.map((l) => [res.insertId, l.product.id, l.product.name, l.product.price, l.qty, l.product.price * l.qty])]
      );
    }
    console.log(`✓ ${DEMO_ORDERS.length} demo orders created`);
  } else {
    console.log(`· ${orderCount} existing orders left untouched`);
  }

  const [stats] = await conn.query(
    `SELECT (SELECT COUNT(*) FROM products) AS products,
            (SELECT COUNT(*) FROM orders) AS orders,
            (SELECT COUNT(*) FROM users) AS users`
  );
  console.log('\nDatabase ready:', JSON.stringify(stats[0]));
  await conn.end();
}

main().catch((err) => {
  console.error('\n✗ Seed failed:', err.message);
  console.error('  → Is MySQL running and are the credentials in server/.env correct?');
  console.error('  → No MySQL? Run the API with DB_DRIVER=memory instead (no seeding needed).');
  process.exit(1);
});
