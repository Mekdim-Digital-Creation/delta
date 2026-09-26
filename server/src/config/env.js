import 'dotenv/config';

const bool = (v, fallback) => (v === undefined ? fallback : v === 'true' || v === '1');

export const env = {
  port: Number(process.env.PORT || 5000),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

  // 'mysql' is the production driver. 'memory' is a zero-config, file-backed
  // store for local development when no MySQL server is available.
  driver: (process.env.DB_DRIVER || 'mysql').toLowerCase(),

  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'delta_print_house',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000),
    max: Number(process.env.RATE_LIMIT_MAX || 400),
  },

  memoryFile: process.env.MEMORY_DB_FILE || './data/store.json',
  corsAllowCredentials: bool(process.env.CORS_CREDENTIALS, true),
};

export const isProd = env.nodeEnv === 'production';
