import { Router } from 'express';
import { PlannerController } from './plannerController';
import { requireAuth } from '../../middleware/auth';

const router = Router();

router.get('/today', requireAuth, PlannerController.getTodayPlan);
router.post('/generate', requireAuth, PlannerController.generatePlan);
router.patch('/tasks/:taskId', requireAuth, PlannerController.toggleTask);

export default router;
