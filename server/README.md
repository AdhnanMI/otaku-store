# Otaku Store API

Express + PostgreSQL (via Prisma) backend for the Otaku Store frontend.
Handles product listing, user accounts (register/login), and orders
(including the UPI payment-screenshot confirmation step).

## 1. Local setup

```bash
cd server
npm install
cp .env.example .env
```

Edit `.env`:
- `DATABASE_URL` — point this at a Postgres database (see "Getting a database" below)
- `JWT_SECRET` — any long random string (`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`)
- `CLIENT_ORIGIN` — your frontend's URL (`http://localhost:5173` for local dev)

Then create the tables and load your product catalog:

```bash
npx prisma migrate dev --name init
npm run seed
npm run dev
```

The API is now running at `http://localhost:4000`. Test it:
`curl http://localhost:4000/api/health` → `{"ok":true}`

## 2. Getting a database (free tier options)

Pick one, grab its connection string, paste into `DATABASE_URL`:

- **Neon** (neon.tech) — serverless Postgres, generous free tier, great for this
- **Supabase** (supabase.com) — Postgres + a dashboard UI to browse tables
- **Railway** (railway.app) — one-click Postgres, easy if you're also hosting the API there

## 3. API overview

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/products` | — | List products (`?category=tshirts` to filter) |
| GET | `/api/products/:id` | — | Single product |
| POST | `/api/auth/register` | — | `{ name, email, password }` → `{ token, user }` |
| POST | `/api/auth/login` | — | `{ email, password }` → `{ token, user }` |
| GET | `/api/auth/me` | ✅ | Current user |
| POST | `/api/orders` | ✅ | Place an order — `{ items: [{productId, qty}], shipping: {...}, couponCode }` |
| GET | `/api/orders` | ✅ | Your order history |
| GET | `/api/orders/:id` | ✅ | One order |
| PATCH | `/api/orders/:id/pay` | ✅ | `multipart/form-data` with a `screenshot` file — marks the order PAID |

Send the JWT from login/register as `Authorization: Bearer <token>` on
protected routes. Prices and totals are always recalculated server-side
from the database — the client only sends product IDs and quantities.

## 4. Deploying

**Database:** Neon or Supabase (see above) — grab the production connection string.

**API (pick one):**
- **Render** (render.com) — New → Web Service → point at your repo, root
  directory `server`, build command `npm install && npx prisma generate`,
  start command `npm start`. Add your `.env` values under Environment.
  Run `npx prisma migrate deploy` once from the Render shell (or locally
  against the prod `DATABASE_URL`) to create tables.
- **Railway** (railway.app) — similar flow, and can host Postgres alongside it.

After deploying, set `CLIENT_ORIGIN` to your deployed frontend's URL, and
set the frontend's API base URL to your deployed backend's URL.

## 5. Payment screenshots — a note on file storage

`PATCH /api/orders/:id/pay` currently saves uploaded screenshots to a local
`uploads/` folder on disk. That's fine for local dev, but **most free-tier
hosts (Render, Railway, etc.) have an ephemeral filesystem** — uploaded
files are wiped on every redeploy or restart. For production, swap the
`multer.diskStorage` in `src/routes/orders.routes.js` for a cloud storage
provider instead — e.g. `multer-storage-cloudinary` (Cloudinary) or
`@aws-sdk/client-s3` (S3 / Cloudflare R2). Happy to wire that up when
you're ready to deploy for real.
