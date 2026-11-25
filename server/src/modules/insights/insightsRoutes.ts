import { Router } from 'express';
import { InsightsController } from './insightsController';
import { requireAuth } from '../../middleware/auth';

const router = Router();

router.post('/simulator', InsightsController.simulateImpact);
router.post('/log-action', requireAuth, InsightsController.logAction);
router.get('/summary', requireAuth, InsightsController.getSummary);

export default router;
