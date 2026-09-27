import { Router } from 'express';
import { getFaqs, createFaq, updateFaq, deleteFaq } from '../controllers/contentController.js';
import { authenticateAdmin } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', getFaqs);
router.post('/', authenticateAdmin, createFaq);
router.put('/:id', authenticateAdmin, updateFaq);
router.delete('/:id', authenticateAdmin, deleteFaq);

export default router;
