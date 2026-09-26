import 'dotenv/config';
import mysql from 'mysql2/promise';

import { env } from '../src/config/env.js';
import { PRODUCTS } from '../src/store/seedData.js';

/**
 * Additive migrations for databases created before a column existed.
 *
 * `schema.sql` is all `CREATE TABLE IF NOT EXISTS`, so re-running it against an
 * existing database will NOT add newly introduced columns. This script closes
 * that gap: it inspects INFORMATION_SCHEMA and applies only the changes that are
 * actually missing, so it is safe to run repeatedly.
 */
async function main() {
  const conn = await mysql.createConnection({
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    multipleStatements: true,
    charset: 'utf8mb4_unicode_ci',
  });

  const db = env.db.database;
  await conn.query(`USE \`${db}\``);
  console.log(`→ Migrating ${db}`);

  const columns = async (table) => {
    const [rows] = await conn.query(
      `SELECT COLUMN_NAME, CHARACTER_MAXIMUM_LENGTH
         FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
      [db, table]
    );
    return rows;
  };

  // ── products.image ───────────────────────────────────────────────────────
  const productCols = await columns('products');
  if (productCols.length === 0) {
    console.log('! products table missing — run `npm run seed` first.');
    await conn.end();
    return;
  }

  const image = productCols.find((c) => c.COLUMN_NAME === 'image');
  if (!image) {
    await conn.query('ALTER TABLE products ADD COLUMN image VARCHAR(500) NULL AFTER gradient');
    console.log('+ products.image added (VARCHAR(500))');
  } else if (Number(image.CHARACTER_MAXIMUM_LENGTH) < 500) {
    await conn.query('ALTER TABLE products MODIFY COLUMN image VARCHAR(500) NULL');
    console.log(`~ products.image widened ${image.CHARACTER_MAXIMUM_LENGTH} → 500`);
  } else {
    console.log('= products.image already VARCHAR(500)');
  }

  // ── contact_messages ────────────────────────────────────────────────────
  const messageCols = await columns('contact_messages');
  if (messageCols.length === 0) {
    await conn.query(`CREATE TABLE IF NOT EXISTS contact_messages (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      name       VARCHAR(120) NOT NULL,
      email      VARCHAR(190) NOT NULL,
      phone      VARCHAR(40)  NULL,
      subject    VARCHAR(160) NOT NULL,
      message    TEXT         NOT NULL,
      status     VARCHAR(10)  NOT NULL DEFAULT 'new',
      created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_status (status),
      INDEX idx_created (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4_unicode_ci`);
    console.log('+ contact_messages created');
  } else {
    console.log('= contact_messages already present');
  }

  // ── backfill product images ─────────────────────────────────────────────
  let backfilled = 0;
  for (const p of PRODUCTS) {
    if (!p.image) continue;
    const [res] = await conn.query(
      'UPDATE products SET image = ? WHERE slug = ? AND (image IS NULL OR image = "")',
      [p.image, p.slug]
    );
    backfilled += res.affectedRows || 0;
  }
  console.log(backfilled ? `+ backfilled ${backfilled} product image(s)` : '= product images already populated');

  await conn.end();
  console.log('✓ Migration complete');
}

main().catch((err) => {
  console.error('✗ Migration failed:', err.message);
  process.exit(1);
});
