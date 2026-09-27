import { Router } from 'express';
import { getReviews, submitReview } from '../controllers/contentController.js';

const router = Router();

router.get('/', getReviews);
router.post('/', submitReview);

export default router;
