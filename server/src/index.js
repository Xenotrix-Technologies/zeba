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
import settingsRoutes from './routes/settingsRoutes.js';
import contentRoutes from './routes/contentRoutes.js';
import faqRoutes from './routes/faqRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

import { authLimiter, checkoutLimiter, contactLimiter, apiLimiter } from './middleware/rateLimiter.js';

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
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://checkout.razorpay.com",
        "https://api.razorpay.com"
      ],
      frameSrc: [
        "'self'",
        "https://api.razorpay.com",
        "https://checkout.razorpay.com"
      ],
      connectSrc: [
        "'self'",
        "https://*.supabase.co",
        "https://api.razorpay.com",
        "https://checkout.razorpay.com",
        "https://lumberjack.razorpay.com",
        "wss://*.supabase.co"
      ],
      imgSrc: [
        "'self'",
        "data:",
        "blob:",
        "https:",
        "https://*.supabase.co",
        "https://checkout.razorpay.com"
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com"
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "data:"
      ],
      objectSrc: ["'none'"]
    }
  }
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

// Static images & videos served from single source of truth (client/public)
const clientPublicPath = path.resolve(__dirname, '../../client/public');
app.use('/images', express.static(path.join(clientPublicPath, 'images')));
app.use('/videos', express.static(path.join(clientPublicPath, 'videos')));

// Mount routes on both /api and root prefixes with specialized rate limiters
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
