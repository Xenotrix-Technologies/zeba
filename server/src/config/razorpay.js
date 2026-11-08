import Razorpay from 'razorpay';
import crypto from 'crypto';
import { config } from './env.js';

export let razorpayInstance = null;

try {
  const keyId = config.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || 'rzp_live_TlKuhbruLAqyod';
  const keySecret = config.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET || 'WnHRxVtx08vPTI5YT1o82NU1';

  if (keyId && keySecret && !keyId.includes('placeholder')) {
    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });
  }
} catch (err) {
  console.warn('⚠️ Razorpay initialization note:', err.message);
}

/**
 * Timing-safe string comparison to prevent timing attacks on cryptographic signatures
 */
function safeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Verify Razorpay payment signature (standard checkout callback)
 */
export function verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, signature) {
  const secret = config.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET || 'WnHRxVtx08vPTI5YT1o82NU1';
  if (!secret || !signature || !razorpayOrderId || !razorpayPaymentId) {
    return false;
  }
  
  try {
    const hmac = crypto.createHmac('sha256', config.RAZORPAY_KEY_SECRET);
    hmac.update(`${razorpayOrderId}|${razorpayPaymentId}`);
    const generatedSignature = hmac.digest('hex');
    
    return safeCompare(generatedSignature, signature);
  } catch (err) {
    console.error('Signature verification error:', err);
    return false;
  }
}

/**
 * Verify Razorpay Webhook signature (incoming webhook event payload)
 */
export function verifyRazorpayWebhookSignature(rawBody, signature, secretOverride = null) {
  const secret = secretOverride || config.RAZORPAY_WEBHOOK_SECRET || config.RAZORPAY_KEY_SECRET;
  if (!secret || !signature || !rawBody) {
    return false;
  }

  try {
    const hmac = crypto.createHmac('sha256', secret);
    if (Buffer.isBuffer(rawBody)) {
      hmac.update(rawBody);
    } else if (typeof rawBody === 'string') {
      hmac.update(rawBody, 'utf8');
    } else {
      hmac.update(JSON.stringify(rawBody), 'utf8');
    }
    const generatedSignature = hmac.digest('hex');

    return safeCompare(generatedSignature, signature);
  } catch (err) {
    console.error('Webhook signature verification error:', err);
    return false;
  }
}
