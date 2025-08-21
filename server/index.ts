import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';

import { pool } from './db.js';
import { requireAuth } from './auth.js';

import authRoutes from './routes/auth.js';
import inventoryRoutes from './routes/inventory.js';
import ordersRoutes from './routes/orders.js';
import staffRoutes from './routes/staff.js';
import suppliersRoutes from './routes/suppliers.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

/** health */
app.get('/healthz', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

/** auth (login, me) */
app.use('/api/auth', authRoutes);

/** protect everything below this line */
app.use('/api', requireAuth);

/** feature routes (protected) */
app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/suppliers', suppliersRoutes);

/** serve the Vite build (if you want to host frontend in the same service) */
app.use(express.static('dist'));
app.get('*', (_req, res) => {
  res.sendFile(process.cwd() + '/dist/index.html');
});

const port = Number(process.env.PORT) || 8080;
app.listen(port, () => {
  console.log(`Server listening on :${port}`);
});
