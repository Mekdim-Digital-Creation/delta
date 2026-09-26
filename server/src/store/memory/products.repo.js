export default function createProductsRepo(store) {
  const now = () => new Date().toISOString().slice(0, 19).replace('T', ' ');

  const sortNewestFirst = (a, b) => String(b.created_at).localeCompare(String(a.created_at));

  return {
    async list({ category, q, includeInactive = false } = {}) {
      const needle = q ? q.toLowerCase() : null;
      return store
        .table('products')
        .filter((p) => {
          if (!includeInactive && p.active !== 1) return false;
          if (category && category !== 'All' && p.category !== category) return false;
          if (needle) {
            const hay = `${p.name} ${p.description || ''}`.toLowerCase();
            if (!hay.includes(needle)) return false;
          }
          return true;
        })
        .sort(sortNewestFirst);
    },

    async categories() {
      return [...new Set(store.table('products').filter((p) => p.active === 1).map((p) => p.category))].sort();
    },

    async findById(id) {
      return store.table('products').find((p) => p.id === Number(id)) || null;
    },

    async findBySlug(slug) {
      return store.table('products').find((p) => p.slug === slug) || null;
    },

    async findManyByIds(ids) {
      const set = new Set(ids.map(Number));
      return store
        .table('products')
        .filter((p) => set.has(p.id))
        .map(({ id, name, price, stock, active }) => ({ id, name, price, stock, active }));
    },

    async create(data) {
      const product = {
        id: store.nextId('products'),
        name: data.name,
        slug: data.slug,
        description: data.description || '',
        category: data.category,
        price: data.price,
        stock: data.stock ?? 0,
        unit_label: data.unit_label || 'piece',
        min_qty: data.min_qty || 1,
        icon: data.icon || 'Printer',
        gradient: data.gradient || 'cyan',
        image: data.image || null,
        active: data.active ? 1 : 0,
        created_at: now(),
        updated_at: now(),
      };
      store.table('products').push(product);
      store.save();
      return product;
    },

    async update(id, data) {
      const product = await this.findById(id);
      if (!product) return null;
      Object.assign(product, {
        name: data.name,
        description: data.description || '',
        category: data.category,
        price: data.price,
        stock: data.stock ?? 0,
        unit_label: data.unit_label || 'piece',
        min_qty: data.min_qty || 1,
        icon: data.icon || 'Printer',
        gradient: data.gradient || 'cyan',
        image: data.image || null,
        active: data.active ? 1 : 0,
        updated_at: now(),
      });
      store.save();
      return product;
    },

    async toggleActive(id) {
      const product = await this.findById(id);
      if (!product) return null;
      product.active = product.active ? 0 : 1;
      product.updated_at = now();
      store.save();
      return { id: product.id, active: Boolean(product.active) };
    },

    async remove(id) {
      const products = store.table('products');
      const idx = products.findIndex((p) => p.id === Number(id));
      if (idx >= 0) products.splice(idx, 1);
      store.save();
    },
  };
}
