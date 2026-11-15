import { Router } from 'express';
import { getOrderByNumber, trackOrder, cancelCustomerOrder } from '../controllers/orderController.js';
import { sendCodOtp, verifyCodOtp, confirmCodOrder } from '../controllers/codController.js';
import { optionalUserOrAdminAuth } from '../middleware/customerAuthMiddleware.js';
import { otpLimiter, checkoutLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// ==============================================================================
// Cash on Delivery (COD) Email OTP Verification & Order Creation
// ==============================================================================
router.post('/cod/send-otp', otpLimiter, sendCodOtp);
router.post('/cod/verify-otp', otpLimiter, verifyCodOtp);
router.post('/cod/confirm', checkoutLimiter, confirmCodOrder);

// Public Tracking
router.get('/track/:orderNumber', trackOrder);

// Order lookup by reference / ID with access control
router.get('/:orderNumber', optionalUserOrAdminAuth, getOrderByNumber);

// Customer cancellation workflow
router.post('/:orderNumber/cancel', optionalUserOrAdminAuth, cancelCustomerOrder);

export default router;
