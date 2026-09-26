import { query } from '../../config/db.js';

const num = (v) => Number(v) || 0;

export default {
  /** Everything the admin dashboard renders, in one round trip. */
  async summary() {
    const [revenue] = await query(
      `SELECT COALESCE(SUM(total), 0) AS revenue FROM orders WHERE status != 'cancelled'`
    );
    const [pending] = await query(`SELECT COUNT(*) AS count FROM orders WHERE status = 'pending'`);
    const [ordersTotal] = await query('SELECT COUNT(*) AS count FROM orders');
    const [productsTotal] = await query('SELECT COUNT(*) AS count FROM products');
    const [productsActive] = await query('SELECT COUNT(*) AS count FROM products WHERE active = 1');
    const [lowStock] = await query(
      'SELECT COUNT(*) AS count FROM products WHERE active = 1 AND stock <= 10'
    );
    const [customers] = await query(`SELECT COUNT(*) AS count FROM users WHERE role = 'customer'`);

    const recentOrders = await query('SELECT * FROM orders ORDER BY created_at DESC LIMIT 8');
    const byStatus = await query(
      `SELECT status, COUNT(*) AS count, COALESCE(SUM(total), 0) AS total
         FROM orders GROUP BY status`
    );
    const byCategory = await query(
      `SELECT p.category, COALESCE(SUM(oi.subtotal), 0) AS revenue, COALESCE(SUM(oi.qty), 0) AS units
         FROM order_items oi
         JOIN products p ON p.id = oi.product_id
         JOIN orders o   ON o.id = oi.order_id
        WHERE o.status != 'cancelled'
        GROUP BY p.category
        ORDER BY revenue DESC`
    );
    const byMethod = await query(
      `SELECT payment_method, COUNT(*) AS count, COALESCE(SUM(total), 0) AS total
         FROM orders WHERE status != 'cancelled' GROUP BY payment_method`
    );
    const last14 = await query(
      `SELECT DATE(created_at) AS day, COUNT(*) AS orders, COALESCE(SUM(total), 0) AS revenue
         FROM orders
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 14 DAY)
        GROUP BY DATE(created_at)
        ORDER BY day ASC`
    );

    return {
      revenue: num(revenue.revenue),
      pendingOrders: num(pending.count),
      totalOrders: num(ordersTotal.count),
      totalProducts: num(productsTotal.count),
      activeProducts: num(productsActive.count),
      lowStock: num(lowStock.count),
      customers: num(customers.count),
      recentOrders,
      byStatus,
      byCategory,
      byMethod,
      last14,
    };
  },
};
