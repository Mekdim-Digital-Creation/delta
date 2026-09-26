export default function createOrdersRepo(store) {
  return {
    /** Mirrors the MySQL transaction: order + items + stock decrements. */
    async create({ orderNo, userId, customer, paymentMethod, notes, total, lines }) {
      const orderId = store.nextId('orders');
      const order = {
        id: orderId,
        order_no: orderNo,
        user_id: userId ?? null,
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone,
        address: customer.address,
        city: customer.city || null,
        payment_method: paymentMethod,
        status: 'pending',
        total,
        notes: notes || null,
        created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
        updated_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
      };
      store.table('orders').push(order);

      for (const line of lines) {
        store.table('order_items').push({
          id: store.nextId('order_items'),
          order_id: orderId,
          product_id: line.product.id,
          product_name: line.product.name,
          unit_price: line.unitPrice,
          qty: line.qty,
          subtotal: line.subtotal,
        });
        const product = store.table('products').find((p) => p.id === line.product.id);
        if (product) product.stock -= line.qty;
      }

      store.save();
      return order;
    },

    async listForUser(userId) {
      const orders = store
        .table('orders')
        .filter((o) => o.user_id === userId)
        .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
        .map((o) => ({ ...o }));

      for (const o of orders) {
        o.items = store.table('order_items').filter((i) => i.order_id === o.id);
      }
      return orders;
    },

    async listAll({ status } = {}) {
      const orders = store
        .table('orders')
        .filter((o) => (status ? o.status === status : true))
        .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
        .slice(0, 500)
        .map((o) => ({ ...o }));

      for (const o of orders) {
        o.items = store.table('order_items').filter((i) => i.order_id === o.id);
      }
      return orders;
    },

    async findById(id) {
      return store.table('orders').find((o) => o.id === Number(id)) || null;
    },

    /** Cancelling returns the consumed stock, mirroring the MySQL driver. */
    async setStatus(id, status) {
      const order = await this.findById(id);
      if (!order) return null;

      if (status === 'cancelled' && order.status !== 'cancelled') {
        for (const item of store.table('order_items').filter((i) => i.order_id === order.id)) {
          if (item.product_id) {
            const product = store.table('products').find((p) => p.id === item.product_id);
            if (product) product.stock += item.qty;
          }
        }
      }

      order.status = status;
      order.updated_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
      store.save();
      return order;
    },
  };
}
