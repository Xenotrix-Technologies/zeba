import { Router } from 'express';
import {
  validateCart,
  createPaymentOrder,
  verifyPayment,
  cancelPayment,
  recordPaymentFailure,
  handleRazorpayWebhook
} from '../controllers/paymentController.js';

const router = Router();

router.post('/validate-cart', validateCart);
router.post('/create-order', createPaymentOrder);
router.post('/verify', verifyPayment);
router.post('/cancel', cancelPayment);
router.post('/fail', recordPaymentFailure);
router.post('/webhook', handleRazorpayWebhook);

export default router;
