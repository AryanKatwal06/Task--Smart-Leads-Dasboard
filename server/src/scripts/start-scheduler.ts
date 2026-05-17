import dotenv from 'dotenv';
import { connectDB } from '../config/db';
import { logger } from '../utils/logger';
import startExportScheduler from '../jobs/exportScheduler';

dotenv.config();

async function bootstrap() {
  try {
    await connectDB(process.env.MONGO_URI || '');
    startExportScheduler();
    logger.info('Export scheduler started');
  } catch (error) {
    logger.error('Failed to start export scheduler', error);
    process.exit(1);
  }
}

void bootstrap();
