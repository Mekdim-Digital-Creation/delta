import { query } from '../../config/db.js';

export default {
  async create({ name, email, phone, subject, message }) {
    const result = await query(
      `INSERT INTO contact_messages (name, email, phone, subject, message)
       VALUES (?, ?, ?, ?, ?)`,
      [name, email, phone || null, subject, message]
    );
    return this.findById(result.insertId);
  },

  async list({ status } = {}) {
    const where = status ? 'WHERE status = ?' : '';
    return query(
      `SELECT * FROM contact_messages ${where} ORDER BY created_at DESC LIMIT 200`,
      status ? [status] : []
    );
  },

  async findById(id) {
    const rows = await query('SELECT * FROM contact_messages WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  },

  async setStatus(id, status) {
    const message = await this.findById(id);
    if (!message) return null;
    await query('UPDATE contact_messages SET status = ? WHERE id = ?', [status, id]);
    return this.findById(id);
  },

  async remove(id) {
    await query('DELETE FROM contact_messages WHERE id = ?', [id]);
  },
};
