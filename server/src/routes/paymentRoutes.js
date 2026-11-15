import { Router } from 'express';
import {
  validateCart,
  createPaymentOrder,
  verifyPayment,
  cancelPayment,
  recordPaymentFailure,
  handleRazorpayWebhook
} from '../controllers/paymentController.js';
import { sendCodOtp, verifyCodOtp, confirmCodOrder } from '../controllers/codController.js';
import { otpLimiter, checkoutLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// COD Email OTP Endpoints (Aliased for compatibility)
router.post('/cod/send-otp', otpLimiter, sendCodOtp);
router.post('/cod/verify-otp', otpLimiter, verifyCodOtp);
router.post('/cod/confirm', checkoutLimiter, confirmCodOrder);

router.post('/validate-cart', validateCart);
router.post('/create-order', createPaymentOrder);
router.post('/verify', verifyPayment);
router.post('/cancel', cancelPayment);
router.post('/fail', recordPaymentFailure);
router.post('/webhook', handleRazorpayWebhook);

export default router;
