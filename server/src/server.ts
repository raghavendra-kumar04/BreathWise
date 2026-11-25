import app from './app';
import { config } from './config/env';
import { connectDB } from './config/db';

const startServer = async () => {
  await connectDB();

  app.listen(config.port, () => {
    console.log(`🚀 BreatheWise API server running on port ${config.port} in ${config.nodeEnv} mode`);
    console.log(`📡 Health check available at: http://localhost:${config.port}/api/health`);
  });
};

startServer();
