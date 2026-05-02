import mongoose from 'mongoose';
import File from '../models/file.model';
import { hashed } from '../lib/bcrypt';
import connectDB from '../lib/mongoose';
import { logger } from '../utils/logger';
require('dotenv').config();

const migrate = async () => {
  try {
    await connectDB();
    logger.info('Connected to database for migration');

    // Find all files that have a password
    const files = await File.find({ password: { $exists: true, $ne: null } }).select('+password');
    logger.info(`Found ${files.length} files with passwords`);

    let migratedCount = 0;
    for (const file of files) {
      if (!file.password) continue;

      // Check if password is already hashed (bcrypt hashes start with $2b$ or $2a$)
      if (file.password.startsWith('$2b$') || file.password.startsWith('$2a$')) {
        continue;
      }

      logger.info(`Migrating password for file: ${file.uuid}`);
      const hashedPassword = await hashed(file.password);
      file.password = hashedPassword;
      await file.save();
      migratedCount++;
    }

    logger.info(`Successfully migrated ${migratedCount} passwords`);
    process.exit(0);
  } catch (error) {
    logger.error('Migration failed:', error);
    process.exit(1);
  }
};

migrate();
