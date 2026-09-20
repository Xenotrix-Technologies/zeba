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
  updateAdminMessageStatus
} from '../controllers/adminController.js';

const router = Router();

// Protect all admin endpoints with requireAdminAuth
router.use(requireAdminAuth);

// Dashboard
router.get('/dashboard', getDashboardMetrics);

// Orders
router.get('/orders', getAdminOrders);
router.get('/orders/:id', getAdminOrderDetail);
router.patch('/orders/:id/status', updateOrderStatus);

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
