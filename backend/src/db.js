import mongoose from 'mongoose';
import { MONGODB_URI } from './config.js';
import logger from './utils/logger.js';

export async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    logger.success('DB CONNECTED');
  } catch (error) {
    logger.error('DB Connection Error:', error);
    process.exit(1);
  }
}
