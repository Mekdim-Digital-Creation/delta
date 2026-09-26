# Delta Print House

A full-stack print & branding storefront for a modern press house. Dark-mode-first UI with
glassmorphic panels, electric cyan/violet gradient accents and Framer Motion micro-interactions —
backed by an Express + MySQL API with JWT auth, role-based access and transactional ordering.

```
delta-print-house/
├── client/                  # React 18 + Vite + Tailwind + Framer Motion
│   ├── index.html
│   ├── vite.config.js       # dev proxy /api → :5000
│   ├── tailwind.config.js   # space/panel/line palette, glow shadows, pulseGlow keyframes
│   ├── postcss.config.js
│   ├── public/favicon.svg
│   └── src/
│       ├── main.jsx         # BrowserRouter + providers
│       ├── App.jsx          # routes + <AdminGuard> role gate
│       ├── index.css        # design tokens & component classes
│       ├── api/client.js    # fetch wrapper, ApiError, endpoint modules
│       ├── context/
│       │   ├── AuthContext.jsx   # login/register/logout, token in localStorage
│       │   └── CartContext.jsx   # cart state, persisted, drawer/checkout flags
│       ├── components/      # landing page + overlays (portals)
│       ├── pages/
│       │   ├── Home.jsx
│       │   └── admin/       # AdminDashboard + 3 panels
│       └── utils/           # formatting + shared product icon registry
│
├── server/                  # Node + Express
│   ├── .env / .env.example
│   ├── sql/
│   │   ├── schema.sql       # users, products, orders, order_items
│   │   └── seed.js          # applies schema + demo data (idempotent)
│   ├── scripts/smoke.js     # 55-assertion end-to-end API test
│   └── src/
│       ├── index.js         # createApp() + start(); CORS, rate limit, route mounting
│       ├── dependencies.js  # repository singleton
│       ├── config/
│       │   ├── env.js       # validated env access
│       │   └── db.js        # mysql2 pool, query(), withTransaction()
│       ├── middleware/      # auth (JWT + requireAdmin + optionalAuth), errors, rate limiter
│       ├── routes/          # auth · products · orders · stats
│       ├── store/           # repository layer (see Storage drivers)
│       │   ├── index.js     # driver selection
│       │   ├── seedData.js  # shared catalogue + demo fixtures
│       │   ├── mysql/       # SQL repositories
│       │   └── memory/      # JSON-file repositories + auto-seed
│       └── utils/           # asyncHandler, HttpError
│
└── package.json             # convenience scripts to run both halves
```

## Storage drivers

The API talks to a repository interface, so the same routes run against either backend.
Pick one with `DB_DRIVER` in `server/.env`.

| Driver             | Use when                                    | Setup                                            |
| ------------------ | ------------------------------------------- | ------------------------------------------------ |
| `DB_DRIVER=mysql`  | deploying / shared environments             | `npm run seed` once — creates schema + demo data |
| `DB_DRIVER=memory` | local dev, demos, CI, no MySQL available    | nothing — auto-seeded into `server/data/store.json` on first boot |

`DB_DRIVER=memory` is a JSON-file store, not an in-process cache: it survives restarts, so
registered accounts and new orders persist. Delete `server/data/store.json` to reset to fixtures.
Because the driver boundary is a single interface (`src/store/index.js`), routes and the client
are unaware of which one is active — `GET /api/health` reports the live driver.

## Quick start

**Fastest path (no database required).** `server/.env` ships with `DB_DRIVER=memory`:

```bash
cd server && npm install && npm run dev   # http://localhost:5000/api/health
```

**Using MySQL instead.** Set `DB_DRIVER=mysql`, point `DB_*` at your server, then seed:

```bash
cd server
npm run seed        # creates the `delta_print_house` database, tables, users, products, orders
```

**Storefront**

```bash
cd client
npm install
npm run dev         # http://localhost:5173
```

Or from the repo root, once both halves are installed:

```bash
npm run install:all
npm run dev         # runs API + Vite together
```

## Tests

```bash
cd server && npm test
```

Runs 55 assertions against the real Express app in-process using the memory driver — auth,
role gates, catalog filtering, product CRUD, server-side re-pricing, stock decrement/restock,
analytics and 404 handling. No MySQL or network access required.

## Demo accounts

| Role     | Email                | Password    |
| -------- | -------------------- | ----------- |
| Admin    | `admin@deltaprint.et` | `Admin@123` |
| Customer | `demo@deltaprint.et`  | `Demo@1234` |

Admins are redirected to `/admin` right after login. `POST /api/auth/register` always creates a
`customer`; promotion is a deliberate DB edit:

```sql
UPDATE users SET role = 'admin' WHERE email = 'you@example.com';
```

## Features

**Storefront** — hero with animated abstract layer, live catalog fetched from the API with
category tabs + debounced search, glassmorphic product cards with stock badges, live price
calculator (quantity / dimensions / finishing multipliers) with a simulated artwork dropzone,
portfolio grid, auto-playing testimonials carousel, footer.

**Cart & checkout** — slide-out drawer with animated line items and quantity steppers, then a
regional checkout drawer offering **Telebirr**, **CBE Birr** and **Cash on Delivery**. Orders are
re-priced server-side, stock is decremented inside a transaction, and cancelling an order restores it.

**Auth** — modal login/register, bcrypt hashes, JWT bearer tokens, `requireAuth` / `requireAdmin`
guards on every privileged route.

**Admin dashboard** — KPI cards (revenue, pending orders, active products, customers), a 14-day
revenue chart, payment-method and category breakdowns, inventory pulse, and a full product
CRUD panel (create, edit, toggle active, delete), plus an orders panel for inspecting payment
methods and advancing fulfillment status.

## API reference

All responses are `{ ok: true, ... }`; errors are `{ ok: false, error: "..." }`. Entity fields
are `snake_case` to match the database schema.

| Method  | Route                     | Access | Purpose                                  |
| ------- | ------------------------- | ------ | ---------------------------------------- |
| `GET`   | `/api/health`             | public | liveness probe + active driver           |
| `POST`  | `/api/auth/register`      | public | create customer account → token           |
| `POST`  | `/api/auth/login`         | public | sign in → token                          |
| `GET`   | `/api/auth/me`            | user   | current profile                          |
| `GET`   | `/api/products`           | public | catalog; `?category=`, `?q=`, `?all=1`   |
| `GET`   | `/api/products/categories`| public | distinct active categories               |
| `GET`   | `/api/products/:id`       | public | single product                           |
| `POST`  | `/api/products`           | admin  | create product                           |
| `PUT`   | `/api/products/:id`       | admin  | update product (full replace)            |
| `PATCH` | `/api/products/:id/toggle`| admin  | flip active/inactive                     |
| `DELETE`| `/api/products/:id`       | admin  | delete product                           |
| `POST`  | `/api/orders`             | user   | place order (transactional, re-priced)   |
| `GET`   | `/api/orders/mine`        | user   | own order history + line items           |
| `GET`   | `/api/orders`             | admin  | all orders + line items; `?status=`      |
| `PATCH` | `/api/orders/:id/status`  | admin  | update fulfillment status (restocks on cancel) |
| `GET`   | `/api/stats`              | admin  | dashboard analytics payload              |

`?all=1` is only honoured for admins; anonymous callers always receive the active catalog.

## Notes

- Order totals are always recomputed from `products.price` on the server; client-sent prices are
  ignored. Stock is checked per line and decremented in the same transaction that inserts the order.
- CORS is restricted to `CLIENT_URL` (default `http://localhost:5173`).
- `/api` is rate limited to 400 requests/minute per IP.
- Change `JWT_SECRET` in `server/.env` before deploying anywhere real.
