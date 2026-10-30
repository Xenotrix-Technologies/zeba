import { Router } from 'express';
import {
  registerCustomer,
  loginCustomer,
  googleCustomerAuth,
  getCustomerProfile,
  getCustomerOrders
} from '../controllers/customerController.js';
import { requireCustomerAuth } from '../middleware/customerAuthMiddleware.js';

const router = Router();

// Public auth routes
router.post('/register', registerCustomer);
router.post('/login', loginCustomer);
router.post('/google', googleCustomerAuth);

// Protected customer account routes
router.get('/me', requireCustomerAuth, getCustomerProfile);
router.get('/orders', requireCustomerAuth, getCustomerOrders);

export default router;
