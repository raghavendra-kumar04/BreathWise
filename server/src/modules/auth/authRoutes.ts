import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { AuthController } from './authController';
import { requireAuth } from '../../middleware/auth';

const router = Router();

// Rate limiter for auth actions (brute force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // 20 attempts per 15 minutes
  message: { error: 'Too many authentication attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', authLimiter, AuthController.register);
router.post('/login', authLimiter, AuthController.login);
router.get('/me', requireAuth, AuthController.getMe);
router.patch('/location', requireAuth, AuthController.updateLocation);
router.patch('/preferences', requireAuth, AuthController.updatePreferences);

export default router;
