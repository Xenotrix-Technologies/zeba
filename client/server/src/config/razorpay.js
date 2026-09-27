import Razorpay from 'razorpay';
import crypto from 'crypto';
import { config } from './env.js';

export let razorpayInstance = null;

try {
  if (config.RAZORPAY_KEY_ID && config.RAZORPAY_KEY_SECRET) {
    razorpayInstance = new Razorpay({
      key_id: config.RAZORPAY_KEY_ID,
      key_secret: config.RAZORPAY_KEY_SECRET
    });
  }
} catch (err) {
  console.warn('⚠️ Razorpay initialization note:', err.message);
}

/**
 * Verify Razorpay payment signature
 */
export function verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, signature) {
  if (!config.RAZORPAY_KEY_SECRET) return false;
  
  const hmac = crypto.createHmac('sha256', config.RAZORPAY_KEY_SECRET);
  hmac.update(`${razorpayOrderId}|${razorpayPaymentId}`);
  const generatedSignature = hmac.digest('hex');
  
  return generatedSignature === signature;
}
