import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/breathewise',
  jwtSecret: process.env.JWT_SECRET || 'dev_jwt_secret_change_in_production_min_32_chars',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  dataGovApiKey: process.env.DATA_GOV_API_KEY || '',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
};
