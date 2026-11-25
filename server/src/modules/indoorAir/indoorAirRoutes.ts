import { Router } from 'express';
import { IndoorAirController } from './indoorAirController';

const router = Router();

router.get('/guidance', IndoorAirController.getGuidance);

export default router;
