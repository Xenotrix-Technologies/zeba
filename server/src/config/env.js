import dotenv from 'dotenv';
dotenv.config();

export const config = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || 'zeba_super_secret_jwt_key_2026_wellness',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || 'rzp_test_zebaPeriodCare99',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || 'zebaSecretKeyRazorpay9988',
  WHATSAPP_NUMBER: process.env.WHATSAPP_NUMBER || '+919876543210',
  WHATSAPP_DISPLAY: process.env.WHATSAPP_DISPLAY || '+91 98765 43210',
  CONTACT_EMAIL: process.env.CONTACT_EMAIL || 'care@zeba.com',
  CONTACT_PHONE: process.env.CONTACT_PHONE || '+91 98765 43210',
  INSTAGRAM_URL: process.env.INSTAGRAM_URL || 'https://instagram.com/zeba.care',
  FACEBOOK_URL: process.env.FACEBOOK_URL || 'https://facebook.com/zeba.care',
  FREE_SHIPPING_THRESHOLD: Number(process.env.FREE_SHIPPING_THRESHOLD || 499),
  STANDARD_SHIPPING_FEE: Number(process.env.STANDARD_SHIPPING_FEE || 49)
};
