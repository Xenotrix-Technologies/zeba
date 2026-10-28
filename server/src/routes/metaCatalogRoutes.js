import express from 'express';
import {
  getMetaProductFeed,
  getMetaCatalogDiagnostics
} from '../controllers/metaCatalogController.js';

const router = express.Router();

// Live diagnostics endpoint (for testing & verification)
router.get('/diagnostics', getMetaCatalogDiagnostics);

// Primary Meta catalog feed endpoints
router.get('/', getMetaProductFeed);
router.get('/feed', getMetaProductFeed);
router.get('/feed.xml', getMetaProductFeed);
router.get('/feed.csv', getMetaProductFeed);
router.get('.xml', getMetaProductFeed);
router.get('.csv', getMetaProductFeed);

export default router;

