import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import { env } from './config/env.js';
import { store } from './dependencies.js';
import { notFound, errorHandler } from './middleware/error.js';
import rateLimit from './middleware/rateLimiter.js';
import { optionalAuth } from './middleware/auth.js';
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/products.routes.js';
import orderRoutes from './routes/orders.routes.js';
import statsRoutes from './routes/stats.routes.js';
import contactRoutes from './routes/contact.routes.js';

/** Builds the Express app. Kept side-effect free so tests can import it. */
export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: [env.clientUrl, 'http://127.0.0.1:5173'],
      credentials: env.corsAllowCredentials,
    })
  );
  app.use(express.json({ limit: '1mb' }));
  app.use('/api', rateLimit());

  app.get('/api/health', (req, res) => {
    res.json({
      ok: true,
      service: 'delta-print-house',
      driver: store.driver,
      uptime: process.uptime(),
    });
  });

  app.use('/api/auth', authRoutes);
  // optionalAuth lets the catalog decide whether `?all=1` is honoured.
  app.use('/api/products', optionalAuth, productRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/stats', statsRoutes);
  app.use('/api/contact', contactRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

/** Boots the app and reports storage health. */
export async function start() {
  const app = createApp();

  if (store.driver === 'memory' && store.store.isEmpty()) {
    const { seedMemoryStore } = await import('./store/index.js');
    await seedMemoryStore(store.store);
    console.log('  ✓ seeded the in-memory store with demo users, products and orders');
  }

  const server = app.listen(env.port, async () => {
    console.log(`\n  ⚡ Delta Print House API → http://localhost:${env.port}/api/health`);
    console.log(`  ⛁  storage driver: ${store.driver}`);
    try {
      await store.verify();
      console.log('  ✓ storage connection verified\n');
    } catch (err) {
      console.error('  ✗ storage connection failed:', err.message);
      console.error('    → Check server/.env and that MySQL is running.');
      console.error('    → Or set DB_DRIVER=memory for a zero-config dev store.\n');
    }
  });

  const shutdown = (signal) => () => {
    console.log(`\n${signal} received — closing.`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 5000).unref();
  };
  process.on('SIGINT', shutdown('SIGINT'));
  process.on('SIGTERM', shutdown('SIGTERM'));

  return server;
}

// Only listen when executed directly, not when imported by a test.
if (process.argv[1] && import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  start();
}

export default createApp;
