import { query, withTransaction } from '../../config/db.js';

export default {
  /**
   * Inserts the order, its line items and decrements stock atomically.
   * `lines` must already be priced and validated by the caller.
   */
  async create({ orderNo, userId, customer, paymentMethod, notes, total, lines }) {
    return withTransaction(async (tx) => {
      const result = await tx.query(
        `INSERT INTO orders (order_no, user_id, customer_name, customer_email, customer_phone,
           address, city, payment_method, status, total, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
        [
          orderNo,
          userId,
          customer.name,
          customer.email,
          customer.phone,
          customer.address,
          customer.city || null,
          paymentMethod,
          total,
          notes || null,
        ]
      );
      const orderId = result.insertId;

      for (const line of lines) {
        await tx.query(
          `INSERT INTO order_items (order_id, product_id, product_name, unit_price, qty, subtotal)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [orderId, line.product.id, line.product.name, line.unitPrice, line.qty, line.subtotal]
        );
        await tx.query('UPDATE products SET stock = stock - ? WHERE id = ?', [
          line.qty,
          line.product.id,
        ]);
      }

      return tx.query('SELECT * FROM orders WHERE id = ? LIMIT 1', [orderId]).then((rows) => ({
        ...rows[0],
        items: lines.map((line) => ({
          product_id: line.product.id,
          product_name: line.product.name,
          unit_price: line.unitPrice,
          qty: line.qty,
          subtotal: line.subtotal,
        })),
      }));
    });
  },

  /** The signed-in customer's history, with line items for the receipt view. */
  async listForUser(userId) {
    const orders = await query('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    if (!orders.length) return orders;

    const ph = orders.map(() => '?').join(',');
    const items = await query(`SELECT * FROM order_items WHERE order_id IN (${ph})`, orders.map((o) => o.id));
    const grouped = new Map();
    for (const item of items) {
      if (!grouped.has(item.order_id)) grouped.set(item.order_id, []);
      grouped.get(item.order_id).push(item);
    }
    for (const o of orders) o.items = grouped.get(o.id) || [];
    return orders;
  },

  /** Admin listing with line items hydrated onto each order. */
  async listAll({ status } = {}) {
    const clauses = [];
    const params = [];
    if (status) {
      clauses.push('status = ?');
      params.push(status);
    }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const orders = await query(
      `SELECT * FROM orders ${where} ORDER BY created_at DESC LIMIT 500`,
      params
    );
    if (!orders.length) return orders;

    const ph = orders.map(() => '?').join(',');
    const items = await query(`SELECT * FROM order_items WHERE order_id IN (${ph})`, orders.map((o) => o.id));
    const grouped = new Map();
    for (const item of items) {
      if (!grouped.has(item.order_id)) grouped.set(item.order_id, []);
      grouped.get(item.order_id).push(item);
    }
    for (const o of orders) o.items = grouped.get(o.id) || [];
    return orders;
  },

  async findById(id) {
    const rows = await query('SELECT * FROM orders WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  },

  /** Cancelling restores the stock that the original order consumed. */
  async setStatus(id, status) {
    const order = await this.findById(id);
    if (!order) return null;

    if (status === 'cancelled' && order.status !== 'cancelled') {
      const items = await query('SELECT product_id, qty FROM order_items WHERE order_id = ?', [id]);
      for (const item of items) {
        if (item.product_id) {
          await query('UPDATE products SET stock = stock + ? WHERE id = ?', [item.qty, item.product_id]);
        }
      }
    }

    await query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    return this.findById(id);
  },
};
