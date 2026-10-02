import { Router } from 'express';
import { requireAdminAuth } from '../middleware/authMiddleware.js';
import {
  getDashboardMetrics,
  getAdminOrders,
  getAdminOrderDetail,
  updateOrderStatus,
  getAdminCustomers,
  getAdminCustomerDetail,
  getAdminProducts,
  updateAdminProduct,
  getAdminMessages,
  updateAdminMessageStatus,
  clearAllTestData,
  getAdminEmailEvents,
  retryAdminFailedEmails,
  testAdminSmtp,
  resendAdminOrderEmail
} from '../controllers/adminController.js';

const router = Router();

// Protect all admin endpoints with requireAdminAuth
router.use(requireAdminAuth);

// Clean Dummy Data
router.post('/clear-test-data', clearAllTestData);
router.delete('/clear-test-data', clearAllTestData);

// Dashboard & Metrics
router.get('/dashboard', getDashboardMetrics);
router.get('/metrics', getDashboardMetrics);

// Orders
router.get('/orders', getAdminOrders);
router.get('/orders/:id', getAdminOrderDetail);
router.patch('/orders/:id/status', updateOrderStatus);
router.post('/orders/:id/resend-email', resendAdminOrderEmail);

// Email Notifications & SMTP Diagnostics
router.get('/emails', getAdminEmailEvents);
router.post('/emails/retry', retryAdminFailedEmails);
router.post('/emails/test-smtp', testAdminSmtp);

// Customers
router.get('/customers', getAdminCustomers);
router.get('/customers/:id', getAdminCustomerDetail);

// Products
router.get('/products', getAdminProducts);
router.patch('/products/:id', updateAdminProduct);

// Messages
router.get('/messages', getAdminMessages);
router.patch('/messages/:id/status', updateAdminMessageStatus);

export default router;
