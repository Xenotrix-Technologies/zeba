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
import settingsRoutes from '../server/src/routes/settingsRoutes.js';
import contentRoutes from '../server/src/routes/contentRoutes.js';
import faqRoutes from '../server/src/routes/faqRoutes.js';
import reviewRoutes from '../server/src/routes/reviewRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security & Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static images
app.use('/images', express.static(path.resolve(__dirname, '../public/images')));

// Non-blocking background database initialization for serverless cold start
let dbInitDone = false;
function initDbBackground() {
  if (!dbInitDone) {
    dbInitDone = true;
    seedDatabase().catch((err) => {
      console.warn('Background serverless DB sync note:', err.message);
      dbInitDone = false;
    });
  }
}
initDbBackground();

// URL Normalization middleware to handle Vercel rewrites & proxies seamlessly
app.use((req, res, next) => {
  if (req.query && req.query.__path) {
    const rawPath = req.query.__path;
    req.url = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
  } else {
    const matched = req.headers['x-matched-path'] || req.headers['x-now-route-matches'] || req.headers['x-invoke-path'] || req.headers['x-forwarded-url'];
    if (matched && (req.url === '/api/index.js' || req.url === '/index.js' || req.url.startsWith('/api/index.js') || req.url.startsWith('/index.js'))) {
      try {
        const urlObj = new URL(matched, 'http://localhost');
        req.url = urlObj.pathname + (urlObj.search || '');
      } catch {
        req.url = matched;
      }
    }
  }

  if (req.url.startsWith('/api/index.js')) {
    req.url = req.url.replace('/api/index.js', '') || '/';
  } else if (req.url.startsWith('/index.js')) {
    req.url = req.url.replace('/index.js', '') || '/';
  }

  next();
});

// Mount routes on all variations: /api/*, /*
const mountRouters = (prefix = '') => {
  app.use(`${prefix}/settings`, settingsRoutes);
  app.use(`${prefix}/content`, contentRoutes);
  app.use(`${prefix}/faqs`, faqRoutes);
  app.use(`${prefix}/reviews`, reviewRoutes);
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

export default app;
export { app };
