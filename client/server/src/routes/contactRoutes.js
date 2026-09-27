import { Router } from 'express';
import { submitContactMessage, getPublicContactConfig } from '../controllers/contactController.js';

const router = Router();

router.post('/', submitContactMessage);
router.get('/config', getPublicContactConfig);

export default router;
