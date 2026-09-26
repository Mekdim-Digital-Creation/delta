import bcrypt from 'bcryptjs';
import { PRODUCTS, DEMO_ADMIN, DEMO_CUSTOMER, DEMO_ORDERS } from '../seedData.js';

/** Populates an empty MemoryStore with the same fixtures the MySQL seeder uses. */
export async function seedMemoryStore(store) {
  const stamp = (daysAgo) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().slice(0, 19).replace('T', ' ');
  };
  const created = stamp(30);

  const adminHash = await bcrypt.hash(DEMO_ADMIN.password, 10);
  const custHash = await bcrypt.hash(DEMO_CUSTOMER.password, 10);

  store.data.users = [
    { id: 1, name: DEMO_ADMIN.name, email: DEMO_ADMIN.email, password_hash: adminHash, phone: DEMO_ADMIN.phone, role: 'admin', created_at: created },
    { id: 2, name: DEMO_CUSTOMER.name, email: DEMO_CUSTOMER.email, password_hash: custHash, phone: DEMO_CUSTOMER.phone, role: 'customer', created_at: created },
  ];
  store.data.seq.users = 2;

  store.data.products = PRODUCTS.map((p, i) => ({
    id: i + 1,
    ...p,
    created_at: stamp(29 - i),
    updated_at: stamp(29 - i),
  }));
  store.data.seq.products = PRODUCTS.length;

  const customerId = 2;
  DEMO_ORDERS.forEach((demo, i) => {
    const lines = demo.lines
      .map((idx) => store.data.products[idx])
      .filter(Boolean)
      .map((product, j) => ({
        id: store.nextId('order_items'),
        order_id: i + 1,
        product_id: product.id,
        product_name: product.name,
        unit_price: product.price,
        qty: 2 + ((i + j) % 4),
        subtotal: 0,
      }));
    for (const line of lines) line.subtotal = line.unit_price * line.qty;

    const total = lines.reduce((acc, l) => acc + l.subtotal, 0);
    store.data.orders.push({
      id: i + 1,
      order_no: `DTH-SEED${100 + i}`,
      user_id: customerId,
      customer_name: DEMO_CUSTOMER.name,
      customer_email: DEMO_CUSTOMER.email,
      customer_phone: DEMO_CUSTOMER.phone,
      address: 'Bole Road, Behind Getu Commercial Center',
      city: 'Addis Ababa',
      payment_method: demo.method,
      status: demo.status,
      total,
      notes: null,
      created_at: stamp(demo.daysAgo),
      updated_at: stamp(demo.daysAgo),
    });
    store.data.order_items.push(...lines);
  });
  store.data.seq.orders = DEMO_ORDERS.length;
  store.data.seq.order_items = store.data.order_items.length;

  store.save();
  return store;
}
