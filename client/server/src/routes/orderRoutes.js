import { Router } from 'express';
import { getOrderByNumber } from '../controllers/orderController.js';

const router = Router();

router.get('/:orderNumber', getOrderByNumber);

export default router;
