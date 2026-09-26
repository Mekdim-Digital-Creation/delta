import { env } from '../config/env.js';
import MemoryStore from './memory/memoryStore.js';
import { seedMemoryStore } from './memory/seed.js';

import mysqlUsers from './mysql/users.repo.js';
import mysqlProducts from './mysql/products.repo.js';
import mysqlOrders from './mysql/orders.repo.js';
import mysqlStats from './mysql/stats.repo.js';
import mysqlMessages from './mysql/messages.repo.js';

import createUsersRepo from './memory/users.repo.js';
import createProductsRepo from './memory/products.repo.js';
import createOrdersRepo from './memory/orders.repo.js';
import createStatsRepo from './memory/stats.repo.js';
import createMessagesRepo from './memory/messages.repo.js';

/**
 * Resolves the active repository bundle. Routes only ever talk to this
 * interface, so swapping MySQL for the file-backed dev store is a one-line
 * change in `DB_DRIVER` — no route or controller edits.
 */
export function createStore() {
  if (env.driver === 'memory') {
    const store = new MemoryStore(env.memoryFile);
    store.load();
    return {
      driver: 'memory',
      verify: async () => true,
      store,
      users: createUsersRepo(store),
      products: createProductsRepo(store),
      orders: createOrdersRepo(store),
      stats: createStatsRepo(store),
      messages: createMessagesRepo(store),
    };
  }

  if (env.driver !== 'mysql') {
    throw new Error(`Unknown DB_DRIVER "${env.driver}" — expected "mysql" or "memory"`);
  }

  let db;
  return {
    driver: 'mysql',
    async verify() {
      db = db || (await import('../config/db.js'));
      return db.verifyConnection();
    },
    users: mysqlUsers,
    products: mysqlProducts,
    orders: mysqlOrders,
    stats: mysqlStats,
    messages: mysqlMessages,
  };
}

export { seedMemoryStore };
export { PRODUCTS, DEMO_ADMIN, DEMO_CUSTOMER, DEMO_ORDERS } from './seedData.js';
