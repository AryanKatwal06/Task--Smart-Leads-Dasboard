import path from 'path';
import fs from 'fs';
import LeadService from '../services/lead.service';
import { clearCache } from '../utils/redis';
import { logger } from '../utils/logger';
import { sendEmail } from '../utils/email';

const EXPORT_DIR = path.resolve(process.cwd(), 'exports');

export async function startExportScheduler() {
  if (!fs.existsSync(EXPORT_DIR)) fs.mkdirSync(EXPORT_DIR, { recursive: true });

  const { default: cron } = await import('node-cron');

  // run daily at 02:00
  cron.schedule('0 2 * * *', async () => {
    try {
      const csv = await LeadService.exportLeads({});
      const filename = `leads-export-${new Date().toISOString().slice(0,10)}.csv`;
      const filepath = path.join(EXPORT_DIR, filename);
      fs.writeFileSync(filepath, csv, 'utf8');
      logger.info('Daily export created:', filepath);

      const recipientEmail = process.env.EXPORT_NOTIFICATION_EMAIL || 'admin@smartleads.com';

      await sendEmail(
        recipientEmail,
        'Daily Leads Export Ready',
        `<p>Your daily export is ready: <strong>${filename}</strong></p><p>File size: ${fs.statSync(filepath).size} bytes</p>`
      );
    } catch (err) {
      logger.error('Export job failed', err);
    }
  });

  // refresh analytics cache every hour at :00
  cron.schedule('0 * * * *', async () => {
    try {
      await clearCache('analytics:*');
      logger.info('Analytics cache cleared');
    } catch (err) {
      logger.error('Cache refresh failed', err);
    }
  });
}

export default startExportScheduler;