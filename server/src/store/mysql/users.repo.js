import { query } from '../../config/db.js';

const PUBLIC_FIELDS =
  'id, name, email, role, phone, created_at';

export default {
  async findByEmail(email) {
    const rows = await query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
    return rows[0] || null;
  },

  async findById(id) {
    const rows = await query(`SELECT ${PUBLIC_FIELDS} FROM users WHERE id = ? LIMIT 1`, [id]);
    return rows[0] || null;
  },

  async create({ name, email, passwordHash, phone, role = 'customer' }) {
    const result = await query(
      'INSERT INTO users (name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, passwordHash, phone || null, role]
    );
    return this.findById(result.insertId);
  },

  async countCustomers() {
    const [row] = await query(`SELECT COUNT(*) AS count FROM users WHERE role = 'customer'`);
    return Number(row.count) || 0;
  },
};
