import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import cartRouter from './routes/cart.routes.js';
import authRoutes from './routes/auth.routes.js';
import productsRoutes from './routes/products.routes.js';
import ordersRoutes from './routes/orders.routes.js';
import wishlistRouter from './routes/wishlist.routes.js';
import adminRoutes from './routes/admin.routes.js';
import categoriesRoutes from './routes/categories.routes.js';
const app = express();

const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

// Serves uploaded payment screenshots at /uploads/<file>
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/cart', cartRouter);
app.use('/api/wishlist', wishlistRouter);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoriesRoutes);

// Centralized error handler (e.g. multer file-type/size errors)
app.use((err, _req, res, _next) => {
  console.error('API Error:', err);

  if (res.headersSent) {
    return;
  }

  res.status(err.status || 500).json({
    error: err.message || 'Something went wrong.',
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Otaku Store API running on port ${PORT}`);
});
