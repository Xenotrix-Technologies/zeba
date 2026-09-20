import { Router } from 'express';
import { login, getMe, changePassword } from '../controllers/authController.js';
import { requireAdminAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/login', login);
router.get('/me', requireAdminAuth, getMe);
router.post('/change-password', requireAdminAuth, changePassword);

export default router;
