import { Router } from 'express';
import { CommunityController } from './communityController';
import { requireAuth } from '../../middleware/auth';

const router = Router();

router.get('/reports', CommunityController.getReports);
router.post('/reports', requireAuth, CommunityController.createReport);
router.post('/reports/:id/upvote', requireAuth, CommunityController.upvoteReport);

export default router;
