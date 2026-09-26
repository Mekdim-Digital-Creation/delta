import { query } from '../../config/db.js';

export default {
  /** `includeInactive` is how the admin panel sees de-listed products. */
  async list({ category, q, includeInactive = false } = {}) {
    const clauses = [];
    const params = [];
    if (!includeInactive) clauses.push('active = 1');
    if (category && category !== 'All') {
      clauses.push('category = ?');
      params.push(category);
    }
    if (q) {
      clauses.push('(name LIKE ? OR description LIKE ?)');
      params.push(`%${q}%`, `%${q}%`);
    }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    return query(`SELECT * FROM products ${where} ORDER BY created_at DESC`, params);
  },

  async categories() {
    const rows = await query(
      'SELECT DISTINCT category FROM products WHERE active = 1 ORDER BY category ASC'
    );
    return rows.map((r) => r.category);
  },

  async findById(id) {
    const rows = await query('SELECT * FROM products WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  },

  async findBySlug(slug) {
    const rows = await query('SELECT id FROM products WHERE slug = ? LIMIT 1', [slug]);
    return rows[0] || null;
  },

  async findManyByIds(ids) {
    if (!ids.length) return [];
    const ph = ids.map(() => '?').join(',');
    return query(
      `SELECT id, name, price, stock, active FROM products WHERE id IN (${ph})`,
      ids
    );
  },

  async create(data) {
    const result = await query(
      `INSERT INTO products (name, slug, description, category, price, stock, unit_label, min_qty, icon, gradient, image, active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.name,
        data.slug,
        data.description || '',
        data.category,
        data.price,
        data.stock ?? 0,
        data.unit_label || 'piece',
        data.min_qty || 1,
        data.icon || 'Printer',
        data.gradient || 'cyan',
        data.image || null,
        data.active ? 1 : 0,
      ]
    );
    return this.findById(result.insertId);
  },

  async update(id, data) {
    await query(
      `UPDATE products
         SET name = ?, description = ?, category = ?, price = ?, stock = ?,
             unit_label = ?, min_qty = ?, icon = ?, gradient = ?, image = ?, active = ?
       WHERE id = ?`,
      [
        data.name,
        data.description || '',
        data.category,
        data.price,
        data.stock ?? 0,
        data.unit_label || 'piece',
        data.min_qty || 1,
        data.icon || 'Printer',
        data.gradient || 'cyan',
        data.image || null,
        data.active ? 1 : 0,
        id,
      ]
    );
    return this.findById(id);
  },

  async toggleActive(id) {
    const product = await this.findById(id);
    if (!product) return null;
    const next = product.active ? 0 : 1;
    await query('UPDATE products SET active = ? WHERE id = ?', [next, id]);
    return { id: Number(id), active: Boolean(next) };
  },

  async remove(id) {
    await query('DELETE FROM products WHERE id = ?', [id]);
  },
};
