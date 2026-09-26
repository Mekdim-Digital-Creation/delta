import { DEMO_ADMIN, DEMO_CUSTOMER } from '../seedData.js';

export default function createUsersRepo(store) {
  const now = () => new Date().toISOString().slice(0, 19).replace('T', ' ');

  return {
    async findByEmail(email) {
      return store.table('users').find((u) => u.email === email) || null;
    },

    async findById(id) {
      const user = store.table('users').find((u) => u.id === Number(id));
      if (!user) return null;
      const { password_hash, ...safe } = user;
      return safe;
    },

    async create({ name, email, passwordHash, phone, role = 'customer' }) {
      const user = {
        id: store.nextId('users'),
        name,
        email,
        password_hash: passwordHash,
        phone: phone || null,
        role,
        created_at: now(),
      };
      store.table('users').push(user);
      store.save();
      return this.findById(user.id);
    },

    async countCustomers() {
      return store.table('users').filter((u) => u.role === 'customer').length;
    },
  };
}

export { DEMO_ADMIN, DEMO_CUSTOMER };
