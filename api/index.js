import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
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

// URL Normalization middleware to handle Vercel rewrites & proxies seamlessly
app.use((req, res, next) => {
  // If __path is passed from Vercel rewrite (?__path=auth/login)
  if (req.query && req.query.__path) {
    const rawPath = req.query.__path;
    req.url = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
  } else if (req.url === '/api/index.js' || req.url === '/index.js' || req.url.startsWith('/api/index.js') || req.url.startsWith('/index.js')) {
    // Restore original path from Vercel headers if URL was rewritten to filename
    const matched = req.headers['x-matched-path'] || req.headers['x-now-route-matches'] || req.headers['x-invoke-path'] || req.headers['x-forwarded-url'];
    if (matched) {
      try {
        const urlObj = new URL(matched, 'http://localhost');
        req.url = urlObj.pathname + (urlObj.search || '');
      } catch {
        req.url = matched;
      }
    }
  }
  next();
});

// Mount routes on all variations: /api/*, /*, /api/index.js/*
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
    environment: process.env.VERCEL ? 'vercel-serverless' : 'node-server',
    timestamp: new Date().toISOString()
  });
});

// JSON 404 handler for API routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: [${req.method}] ${req.originalUrl || req.url}`
  });
});

// Error handling
app.use(errorHandler);

export default function handler(req, res) {
  return app(req, res);
}
export { app };
