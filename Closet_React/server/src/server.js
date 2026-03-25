import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import mongoose from 'mongoose';

import { connectToDatabase, getDatabaseStatus } from './utils/db.js';
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import userRoutes from './routes/user.routes.js';
import orderRoutes from './routes/order.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import contactRoutes from './routes/contact.routes.js';
import passwordRoutes from './routes/password.routes.js';
import path from 'path';

const app = express();

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({ origin: CLIENT_URL, credentials: true }));

app.use(express.json({ limit: '10mb' }));
// Serve static files with proper headers
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', CLIENT_URL);
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(process.cwd(), 'public', 'uploads')));



app.get('/api/health', (req, res) => {
  const db = getDatabaseStatus();
  const ok = db.readyState === 1;
  res.status(ok ? 200 : 500).json({ ok, db });
});

// Debug route for uploads
app.get('/api/debug/files', (req, res) => {
  const uploadsPath = path.join(process.cwd(), 'public', 'uploads');
  import('fs').then(fs => {
    try {
      const userFiles = fs.existsSync(path.join(uploadsPath, 'photos_user')) ? fs.readdirSync(path.join(uploadsPath, 'photos_user')) : [];
      const productFiles = fs.existsSync(path.join(uploadsPath, 'photos_products')) ? fs.readdirSync(path.join(uploadsPath, 'photos_products')) : [];
      res.json({ uploadsPath, userFiles, productFiles });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/user', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/password', passwordRoutes);

const PORT = process.env.PORT || 4000;

connectToDatabase()
  .then(() => {
    app.listen(PORT, () => {
      const db = getDatabaseStatus();
      // Server started successfully
    });
  })
  .catch((error) => {
    // Failed to start server
    process.exit(1);
  });


