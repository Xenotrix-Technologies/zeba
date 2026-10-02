import dotenv from 'dotenv';
import { businessConfig } from './businessConfig.js';
dotenv.config();

export const config = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  APP_URL: process.env.APP_URL || businessConfig.websiteUrl,
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || 'zeba_super_secret_jwt_key_2026_wellness',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || 'rzp_test_zebaPeriodCare99',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || 'zebaSecretKeyRazorpay9988',
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET || 'zebaSecretKeyRazorpay9988',
  WHATSAPP_NUMBER: businessConfig.whatsappNumber,
  WHATSAPP_DISPLAY: businessConfig.whatsappDisplay,
  CONTACT_EMAIL: businessConfig.supportEmail,
  CONTACT_PHONE: businessConfig.supportPhone,
  INSTAGRAM_URL: businessConfig.social.instagram,
  FACEBOOK_URL: businessConfig.social.facebook,
  FREE_SHIPPING_THRESHOLD: businessConfig.commerce.freeShippingThreshold,
  STANDARD_SHIPPING_FEE: businessConfig.commerce.standardShippingFee,
  ADMIN_DEFAULT_EMAIL: process.env.ADMIN_DEFAULT_EMAIL || 'zebaofficial2013@gmail.com',
  ADMIN_DEFAULT_PASSWORD: process.env.ADMIN_DEFAULT_PASSWORD || 'Zeba@2013.?',
  // Transactional Email / SMTP Configuration
  EMAIL_HOST: process.env.EMAIL_HOST || process.env.SMTP_HOST || '',
  EMAIL_PORT: parseInt(process.env.EMAIL_PORT || process.env.SMTP_PORT || '587', 10),
  EMAIL_USER: process.env.EMAIL_USER || process.env.SMTP_USER || '',
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS || process.env.SMTP_PASSWORD || process.env.SMTP_PASS || '',
  EMAIL_FROM: process.env.EMAIL_FROM || process.env.EMAIL_FROM_ADDRESS || businessConfig.supportEmail || 'orders@zebaofficial.in',
  EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME || 'ZEBA',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || process.env.OWNER_EMAIL || process.env.ADMIN_DEFAULT_EMAIL || 'admin@zebaofficial.in',
  // Backward compatibility SMTP aliases
  SMTP_HOST: process.env.EMAIL_HOST || process.env.SMTP_HOST || '',
  SMTP_PORT: parseInt(process.env.EMAIL_PORT || process.env.SMTP_PORT || '587', 10),
  SMTP_SECURE: process.env.EMAIL_PORT === '465' || process.env.SMTP_PORT === '465' || process.env.SMTP_SECURE === 'true',
  SMTP_USER: process.env.EMAIL_USER || process.env.SMTP_USER || '',
  SMTP_PASSWORD: process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS || process.env.SMTP_PASSWORD || process.env.SMTP_PASS || '',
  business: businessConfig
};

