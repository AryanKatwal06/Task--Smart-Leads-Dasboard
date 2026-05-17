import csv from 'csv-parser';
import { Readable } from 'stream';
import LeadRepository from '../repositories/lead.repository';
import { logger } from '../utils/logger';
import { ILead, LeadSource, LeadStatus } from '../models/lead.model';

export interface BulkImportError {
  rowIndex: number;
  row: Record<string, string>;
  error: string;
}

export interface BulkImportResult {
  imported: number;
  failed: number;
  leads: ILead[];
  errors: BulkImportError[];
}

export const BulkImportService = {
  async importLeadsFromCSV(fileBuffer: Buffer): Promise<BulkImportResult> {
    const rows: Record<string, string>[] = [];

    // First parse the CSV into memory (rows only)
    await new Promise<void>((resolve, reject) => {
      Readable.from([fileBuffer])
        .pipe(csv(['name', 'email', 'status', 'source']))
        .on('data', (row: Record<string, string>) => rows.push(row))
        .on('end', () => resolve())
        .on('error', reject);
    });

    const results: ILead[] = [];
    const errors: BulkImportError[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        const name = (row.name || '').trim();
        const email = (row.email || '').trim().toLowerCase();
        const status = ((row.status || 'New').trim()) as LeadStatus;
        const source = ((row.source || 'Website').trim()) as LeadSource;

        if (!name || !email) {
          errors.push({ rowIndex: i, row, error: 'Missing name or email' });
          continue;
        }

        const lead = await LeadRepository.create({ name, email, status, source });
        results.push(lead);
      } catch (err) {
        errors.push({ rowIndex: i, row, error: (err as Error).message });
        logger.error('Failed to import lead', err);
      }
    }

    return {
      imported: results.length,
      failed: errors.length,
      leads: results,
      errors
    };
  }
};

export default BulkImportService;
