import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { businessConfig } from './businessConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from multiple potential locations for root vs server execution
const envPaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), 'server/.env'),
  path.resolve(__dirname, '../../.env'),
  path.resolve(__dirname, '../../../.env')
];

for (const p of envPaths) {
  dotenv.config({ path: p });
}

const isProd = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);

// Validate critical variables in production without exposing sensitive data
if (isProd) {
  const missing = [];
  if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL) missing.push('DATABASE_URL');
  if (!process.env.JWT_SECRET) missing.push('JWT_SECRET');
  if (missing.length > 0) {
    console.warn(`⚠️ Security Notice: Missing recommended production environment variables: ${missing.join(', ')}`);
  }
}

export const config = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  APP_URL: process.env.APP_URL || businessConfig.websiteUrl,
  DATABASE_URL: process.env.DATABASE_URL || process.env.POSTGRES_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || (isProd ? '' : 'zeba_dev_jwt_secret_local_testing_only'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || '',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || '',
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET || '',
  WHATSAPP_NUMBER: businessConfig.whatsappNumber,
  WHATSAPP_DISPLAY: businessConfig.whatsappDisplay,
  CONTACT_EMAIL: process.env.CONTACT_EMAIL || businessConfig.supportEmail || 'info@zebaofficial.in',
  CONTACT_PHONE: businessConfig.supportPhone,
  INSTAGRAM_URL: businessConfig.social.instagram,
  FACEBOOK_URL: businessConfig.social.facebook,
  FREE_SHIPPING_THRESHOLD: businessConfig.commerce.freeShippingThreshold,
  STANDARD_SHIPPING_FEE: businessConfig.commerce.standardShippingFee,
  ADMIN_DEFAULT_EMAIL: (process.env.ADMIN_DEFAULT_EMAIL || 'zebaofficial2013@gmail.com').trim().toLowerCase(),
  ADMIN_DEFAULT_PASSWORD: process.env.ADMIN_DEFAULT_PASSWORD || (isProd ? '' : 'ZebaDev@2026!?'),
  // Transactional Email / SMTP Configuration
  EMAIL_HOST: (process.env.EMAIL_HOST || process.env.SMTP_HOST || 'smtp.gmail.com').trim(),
  EMAIL_PORT: parseInt(process.env.EMAIL_PORT || process.env.SMTP_PORT || '465', 10),
  EMAIL_USER: (process.env.EMAIL_USER || process.env.SMTP_USER || '').trim(),
  EMAIL_PASSWORD: (process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS || process.env.SMTP_PASSWORD || process.env.SMTP_PASS || '').trim(),
  EMAIL_FROM: (process.env.EMAIL_FROM || process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER || 'info@zebaofficial.in').trim(),
  EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME || 'ZEBA',
  ADMIN_EMAIL: (process.env.ADMIN_EMAIL || process.env.OWNER_EMAIL || process.env.EMAIL_USER || 'info@zebaofficial.in').trim(),
  // Backward compatibility SMTP aliases
  SMTP_HOST: (process.env.EMAIL_HOST || process.env.SMTP_HOST || 'smtp.gmail.com').trim(),
  SMTP_PORT: parseInt(process.env.EMAIL_PORT || process.env.SMTP_PORT || '465', 10),
  SMTP_SECURE: (process.env.EMAIL_PORT === '465' || process.env.SMTP_PORT === '465' || process.env.SMTP_SECURE === 'true') && process.env.SMTP_SECURE !== 'false',
  SMTP_USER: (process.env.EMAIL_USER || process.env.SMTP_USER || '').trim(),
  SMTP_PASSWORD: (process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS || process.env.SMTP_PASSWORD || process.env.SMTP_PASS || '').trim(),
  business: businessConfig
};


