import { Router } from 'express';
import { AssistantController } from './assistantController';
import { requireAuth } from '../../middleware/auth';

const router = Router();

router.post('/chat', requireAuth, AssistantController.chat);
router.get('/history', requireAuth, AssistantController.getHistory);
router.delete('/history', requireAuth, AssistantController.clearHistory);

export default router;
