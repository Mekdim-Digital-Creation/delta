const isoDay = (d) => d.toISOString().slice(0, 10);

export default function createStatsRepo(store) {
  return {
    async summary() {
      const orders = store.table('orders');
      const products = store.table('products');
      const users = store.table('users');
      const items = store.table('order_items');

      const live = orders.filter((o) => o.status !== 'cancelled');
      const sum = (rows) => rows.reduce((acc, r) => acc + Number(r.total) || 0, 0);

      // ── 14-day revenue trend (cancelled orders excluded) ────────────────
      const cutoff = new Date();
      cutoff.setHours(0, 0, 0, 0);
      cutoff.setDate(cutoff.getDate() - 13);
      const cutoffKey = isoDay(cutoff);
      const trendMap = new Map();
      for (const o of live) {
        const key = isoDay(new Date(o.created_at));
        if (key < cutoffKey) continue;
        if (!trendMap.has(key)) trendMap.set(key, { day: key, orders: 0, revenue: 0 });
        const bucket = trendMap.get(key);
        bucket.orders += 1;
        bucket.revenue += Number(o.total) || 0;
      }
      const last14 = [...trendMap.values()].sort((a, b) => a.day.localeCompare(b.day));

      // ── Revenue by category (via line items) ───────────────────────────
      const categoryMap = new Map();
      const productById = new Map(products.map((p) => [p.id, p]));
      for (const item of items) {
        const order = orders.find((o) => o.id === item.order_id);
        if (!order || order.status === 'cancelled') continue;
        const product = item.product_id ? productById.get(item.product_id) : null;
        const key = product?.category || 'Uncategorised';
        if (!categoryMap.has(key)) categoryMap.set(key, { category: key, revenue: 0, units: 0 });
        const bucket = categoryMap.get(key);
        bucket.revenue += Number(item.subtotal) || 0;
        bucket.units += Number(item.qty) || 0;
      }
      const byCategory = [...categoryMap.values()].sort((a, b) => b.revenue - a.revenue);

      return {
        revenue: sum(live),
        pendingOrders: orders.filter((o) => o.status === 'pending').length,
        totalOrders: orders.length,
        totalProducts: products.length,
        activeProducts: products.filter((p) => p.active === 1).length,
        lowStock: products.filter((p) => p.active === 1 && p.stock <= 10).length,
        customers: users.filter((u) => u.role === 'customer').length,
        recentOrders: [...orders]
          .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
          .slice(0, 8),
        byStatus: [...orders.reduce((map, o) => {
          const b = map.get(o.status) || { status: o.status, count: 0, total: 0 };
          b.count += 1;
          b.total += Number(o.total) || 0;
          map.set(o.status, b);
          return map;
        }, new Map()).values()],
        byCategory,
        byMethod: [...live.reduce((map, o) => {
          const b = map.get(o.payment_method) || { payment_method: o.payment_method, count: 0, total: 0 };
          b.count += 1;
          b.total += Number(o.total) || 0;
          map.set(o.payment_method, b);
          return map;
        }, new Map()).values()],
        last14,
      };
    },
  };
}
