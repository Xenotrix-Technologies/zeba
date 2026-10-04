import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import '../server/src/config/env.js';
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

import { authLimiter, checkoutLimiter, contactLimiter, apiLimiter } from '../server/src/middleware/rateLimiter.js';

// Allowed CORS origins
const allowedOrigins = [
  'https://www.zebaofficial.in',
  'https://zebaofficial.in',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5000',
  'http://127.0.0.1:5000'
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1') ||
      origin.includes('192.168.') ||
      origin.includes('10.') ||
      origin.includes('zebaofficial')
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-bypass-rate-limit']
};

// Security & Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false
}));

app.use(cors(corsOptions));

app.use(express.json({
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Global API rate limiting
app.use('/api', apiLimiter);

// Static images
app.use('/images', express.static(path.resolve(__dirname, '../client/public/images')));

// Lazy non-blocking database initialization for serverless cold start
let dbInitDone = false;
app.use((req, res, next) => {
  if (!dbInitDone) {
    dbInitDone = true;
    seedDatabase().catch((err) => {
      console.warn('Background serverless DB sync note:', err.message);
      dbInitDone = false;
    });
  }
  next();
});

// URL Normalization middleware to handle Vercel rewrites & proxies seamlessly
app.use((req, res, next) => {
  // 1. If __path is passed from query string
  if (req.query && req.query.__path) {
    let rawPath = String(req.query.__path).trim();
    if (!rawPath.startsWith('/')) rawPath = `/${rawPath}`;
    
    // Remove __path from query params so it doesn't pollute downstream handlers
    delete req.query.__path;
    
    // Reconstruct clean query string
    const queryKeys = Object.keys(req.query);
    const queryString = queryKeys.length > 0 
      ? '?' + new URLSearchParams(req.query).toString()
      : '';
      
    req.url = rawPath + queryString;
  } else {
    const matched = req.headers['x-matched-path'] || 
                    req.headers['x-vercel-matched-path'] || 
                    req.headers['x-now-route-matches'] || 
                    req.headers['x-invoke-path'] || 
                    req.headers['x-forwarded-url'];
                    
    if (matched && (req.url === '/' || req.url === '/api' || req.url.startsWith('/api/index') || req.url.startsWith('/index.js'))) {
      try {
        const urlObj = new URL(matched, 'http://localhost');
        req.url = urlObj.pathname + (urlObj.search || '');
      } catch {
        req.url = matched;
      }
    }
  }

  // Strip redundant filename paths if still present
  if (req.url.startsWith('/api/index.js')) {
    req.url = req.url.replace('/api/index.js', '') || '/';
  } else if (req.url.startsWith('/api/index')) {
    req.url = req.url.replace('/api/index', '') || '/';
  } else if (req.url.startsWith('/index.js')) {
    req.url = req.url.replace('/index.js', '') || '/';
  }

  next();
});

// Mount routes on both /api/* and root /* prefixes
const mountRouters = (prefix = '') => {
  app.use(`${prefix}/settings`, settingsRoutes);
  app.use(`${prefix}/content`, contentRoutes);
  app.use(`${prefix}/faqs`, faqRoutes);
  app.use(`${prefix}/reviews`, reviewRoutes);
  app.use(`${prefix}/auth`, authRoutes);
  app.use(`${prefix}/customer`, customerRoutes);
  app.use(`${prefix}/products`, productRoutes);
  app.use(`${prefix}/orders`, orderRoutes);
  app.use(`${prefix}/payments`, checkoutLimiter, paymentRoutes);
  app.use(`${prefix}/contact`, contactLimiter, contactRoutes);
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

