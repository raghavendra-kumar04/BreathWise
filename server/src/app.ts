import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/env';
import authRoutes from './modules/auth/authRoutes';
import airQualityRoutes from './modules/airQuality/airQualityRoutes';
import plannerRoutes from './modules/planner/plannerRoutes';
import assistantRoutes from './modules/assistant/assistantRoutes';
import indoorAirRoutes from './modules/indoorAir/indoorAirRoutes';
import communityRoutes from './modules/community/communityRoutes';
import insightsRoutes from './modules/insights/insightsRoutes';

const app: Application = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.clientUrl,
  credentials: true,
}));

// Body parser
app.use(express.json());

// Global Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { error: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    app: 'BreatheWise API',
    version: '1.0.0',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// Mount modules
app.use('/api/auth', authRoutes);
app.use('/api/air-quality', airQualityRoutes);
app.use('/api/planner', plannerRoutes);
app.use('/api/assistant', assistantRoutes);
app.use('/api/indoor-air', indoorAirRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/insights', insightsRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: config.nodeEnv === 'development' ? err.message : undefined,
  });
});

export default app;
