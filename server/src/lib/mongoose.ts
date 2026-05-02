import { connect, disconnect } from 'mongoose';
import { logger } from '../utils/logger';
import { AppError } from '../utils/errorHandler';
import { env } from '../config/env';

const connectionOptions = {
  serverApi: {
    version: '1' as const,
    strictVersion: true,
    deprecationErrors: true,
  },
  dbName: 'FileGo',
};

export const connectDB = async () => {
  try {
    await connect(env.MONGO_URL, connectionOptions);
    logger.info('MongoDB connected');
  } catch (error: any) {
    logger.error('MongoDB connection error:', error);
    throw new AppError('MongoDB connection error', 500);
  }
};

export const disconnectDB = async () => {
  try {
    await disconnect();
    logger.info('MongoDB disconnected');
  } catch (error: any) {
    logger.error('MongoDB disconnection error:', error);
    throw new AppError('MongoDB disconnection error', 500);
  }
};

export default connectDB;
