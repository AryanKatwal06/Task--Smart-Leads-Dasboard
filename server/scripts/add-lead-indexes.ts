import dotenv from 'dotenv';
import { connectDB } from '../src/config/db';
import { LeadModel } from '../src/models/lead.model';

dotenv.config();

(async () => {
  try {
    const uri = process.env.MONGO_URI || '';
    await connectDB(uri);
    await LeadModel.createIndexes();
    process.exit(0);
  } catch (err) {
    console.error('Failed to create indexes', err);
    process.exit(1);
  }
})();
