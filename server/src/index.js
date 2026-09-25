import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config/env.js';
import { seedDatabase } from '../database/seed.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import customerRoutes from './routes/customerRoutes.js';

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
app.use('/images', express.static(path.resolve(__dirname, '../public/images')));

// Mount routes on both /api and root prefixes
const mountRouters = (prefix = '') => {
  app.use(`${prefix}/auth`, authRoutes);
  app.use(`${prefix}/customer`, customerRoutes);
  app.use(`${prefix}/products`, productRoutes);
  app.use(`${prefix}/orders`, orderRoutes);
  app.use(`${prefix}/payments`, paymentRoutes);
  app.use(`${prefix}/contact`, contactRoutes);
  app.use(`${prefix}/admin`, adminRoutes);
};

mountRouters('/api');
mountRouters('');

// Health check
app.get(['/api/health', '/health'], (req, res) => {
  res.json({
    status: 'online',
    brand: 'ZEBA Period Care',
    timestamp: new Date().toISOString()
  });
});

// JSON 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API route not found: [${req.method}] ${req.originalUrl || req.url}`
  });
});

// Error handling
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    await seedDatabase();
    
    app.listen(config.PORT, () => {
      console.log(`🚀 ZEBA Backend API running at http://localhost:${config.PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
