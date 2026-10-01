import { Router } from 'express';
import { getOrderByNumber, trackOrder, cancelCustomerOrder } from '../controllers/orderController.js';
import { optionalUserOrAdminAuth } from '../middleware/customerAuthMiddleware.js';

const router = Router();

// Public Tracking
router.get('/track/:orderNumber', trackOrder);

// Order lookup by reference / ID with access control
router.get('/:orderNumber', optionalUserOrAdminAuth, getOrderByNumber);

// Customer cancellation workflow
router.post('/:orderNumber/cancel', optionalUserOrAdminAuth, cancelCustomerOrder);

export default router;
