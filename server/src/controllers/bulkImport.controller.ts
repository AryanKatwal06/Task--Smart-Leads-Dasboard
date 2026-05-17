import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler';
import BulkImportService, { BulkImportResult } from '../services/bulkImport.service';
import AuditService from '../services/audit.service';

export const bulkImportLeads = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file provided' });
  }

  const result: BulkImportResult = await BulkImportService.importLeadsFromCSV(req.file.buffer);

  // Log the import action
  await AuditService.log('BULK_IMPORT', 'leads', req.user?.id, req.user?.role, {
    imported: result.imported,
    failed: result.failed
  });

  res.json(result);
});
