import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../server/src/config/env.js';
import { seedDatabase } from '../server/database/seed.js';
import { errorHandler } from '../server/src/middleware/errorHandler.js';

import authRoutes from '../server/src/routes/authRoutes.js';
import customerRoutes from '../server/src/routes/customerRoutes.js';
import productRoutes from '../server/src/routes/productRoutes.js';
import orderRoutes from '../server/src/routes/orderRoutes.js';
import paymentRoutes from '../server/src/routes/paymentRoutes.js';
import contactRoutes from '../server/src/routes/contactRoutes.js';
import adminRoutes from '../server/src/routes/adminRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security & Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static images
app.use('/images', express.static(path.resolve(__dirname, '../client/public/images')));

// Database initialization flag for serverless cold start
let dbInitialized = false;
app.use(async (req, res, next) => {
  if (!dbInitialized) {
    try {
      await seedDatabase();
      dbInitialized = true;
    } catch (err) {
      console.warn('DB initialization notice during cold start:', err.message);
    }
  }
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    brand: 'ZEBA Period Care',
    environment: process.env.VERCEL ? 'vercel-serverless' : 'node-server',
    timestamp: new Date().toISOString()
  });
});

// Error handling
app.use(errorHandler);

export default app;
