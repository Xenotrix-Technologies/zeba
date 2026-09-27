import { Router } from 'express';
import { getPublicSettings, updateStoreSetting } from '../controllers/settingsController.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', getPublicSettings);
router.put('/:key', authenticateAdmin, updateStoreSetting);

export default router;
