import fs from 'node:fs';
import path from 'node:path';

/**
 * Tiny JSON-file backed store used when no MySQL server is available
 * (`DB_DRIVER=memory`). It mirrors the repository interface in ./mysql so the
 * routes are driver-agnostic. Data survives restarts; delete the file to reset.
 */
export default class MemoryStore {
  constructor(file) {
    this.file = path.resolve(file);
    this.data = {
      users: [],
      products: [],
      orders: [],
      order_items: [],
      contact_messages: [],
      seq: {},
    };
  }

  load() {
    if (fs.existsSync(this.file)) {
      try {
        const raw = JSON.parse(fs.readFileSync(this.file, 'utf8'));
        this.data = { ...this.data, ...raw };
      } catch {
        /* corrupt file — start clean */
      }
    }
    // Files written by an older version may predate some tables.
    for (const key of ['users', 'products', 'orders', 'order_items', 'contact_messages']) {
      if (!Array.isArray(this.data[key])) this.data[key] = [];
    }
    if (!this.data.seq || typeof this.data.seq !== 'object') this.data.seq = {};
    return this.data;
  }

  save() {
    fs.mkdirSync(path.dirname(this.file), { recursive: true });
    fs.writeFileSync(this.file, JSON.stringify(this.data, null, 2));
  }

  nextId(table) {
    const key = table === 'users' ? 'users' : table;
    this.data.seq[key] = (this.data.seq[key] || 0) + 1;
    return this.data.seq[key];
  }

  table(name) {
    return this.data[name];
  }

  isEmpty() {
    return this.data.users.length === 0 && this.data.products.length === 0;
  }
}
