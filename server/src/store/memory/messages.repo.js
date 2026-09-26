export default function createMessagesRepo(store) {
  const now = () => new Date().toISOString().slice(0, 19).replace('T', ' ');

  return {
    async create({ name, email, phone, subject, message }) {
      const row = {
        id: store.nextId('contact_messages'),
        name,
        email,
        phone: phone || null,
        subject,
        message,
        status: 'new',
        created_at: now(),
      };
      store.table('contact_messages').push(row);
      store.save();
      return row;
    },

    async list({ status } = {}) {
      return store
        .table('contact_messages')
        .filter((m) => (status ? m.status === status : true))
        .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
        .slice(0, 200)
        .map((m) => ({ ...m }));
    },

    async findById(id) {
      return store.table('contact_messages').find((m) => m.id === Number(id)) || null;
    },

    async setStatus(id, status) {
      const row = await this.findById(id);
      if (!row) return null;
      row.status = status;
      store.save();
      return { ...row };
    },

    async remove(id) {
      const rows = store.table('contact_messages');
      const idx = rows.findIndex((m) => m.id === Number(id));
      if (idx >= 0) rows.splice(idx, 1);
      store.save();
    },
  };
}
