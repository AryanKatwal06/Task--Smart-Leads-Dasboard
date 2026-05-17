import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler';
import LeadService, { listExports, getExportFile } from '../services/lead.service';
import { findForExportCursor } from '../repositories/lead.repository';
import { generateFilename, streamCursorToResponse } from '../utils/csv';
import { getCache, setCache } from '../utils/redis';
import AuditService from '../services/audit.service';

import { FindLeadsQuery } from '../repositories/lead.repository';

function parseFindLeadsQuery(req: Request): FindLeadsQuery {
  const q: FindLeadsQuery = {};
  if (typeof req.query.status === 'string') q.status = req.query.status as FindLeadsQuery['status'];
  if (typeof req.query.source === 'string') q.source = req.query.source as FindLeadsQuery['source'];
  if (typeof req.query.search === 'string') q.search = req.query.search;
  if (typeof req.query.startDate === 'string') q.startDate = req.query.startDate;
  if (typeof req.query.endDate === 'string') q.endDate = req.query.endDate;
  if (req.query.page) q.page = Number(req.query.page);
  if (req.query.limit) q.limit = Number(req.query.limit);
  if (typeof req.query.sortBy === 'string' && ['name', 'email', 'status', 'source', 'createdAt', 'updatedAt'].includes(req.query.sortBy)) {
    q.sortBy = req.query.sortBy as NonNullable<FindLeadsQuery['sortBy']>;
  }
  if (req.query.sortOrder === 'asc' || req.query.sortOrder === 'desc') q.sortOrder = req.query.sortOrder as 'asc' | 'desc';
  return q;
}

export const createLead = asyncHandler(async (req: Request, res: Response) => {
  const lead = await LeadService.createLead(req.body);
  res.status(201).json({ lead });
});

export const getLeads = asyncHandler(async (req: Request, res: Response) => {
  const leads = await LeadService.getAllLeads(parseFindLeadsQuery(req));
  res.json(leads);
});

export const getLead = asyncHandler(async (req: Request, res: Response) => {
  const lead = await LeadService.getLeadById(req.params.id);
  res.json({ lead });
});

export const updateLead = asyncHandler(async (req: Request, res: Response) => {
  const lead = await LeadService.updateLead(req.params.id, req.body);
  res.json({ lead });
});

export const deleteLead = asyncHandler(async (req: Request, res: Response) => {
  await LeadService.deleteLead(req.params.id);
  res.status(204).send();
});

export const getAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const query = parseFindLeadsQuery(req);

  // Build cache key from query params
  const cacheKey = `analytics:${JSON.stringify(query)}`;

  // Try to get from cache
  const cached = await getCache(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  // Compute analytics
  const data = await LeadService.getAnalytics(query);

  // Cache for 30 minutes
  await setCache(cacheKey, data, 1800);

  res.json(data);
});

export const exportLeads = asyncHandler(async (req: Request, res: Response) => {
  const query = parseFindLeadsQuery(req);

  // Log the export request
  await AuditService.log('EXPORT_ON_DEMAND', 'leads', req.user?.id, req.user?.role, query);

  // Stream CSV using cursor to avoid loading all leads into memory
  const cursor = findForExportCursor(query);
  // allow client to request saving the export to the exports/ folder
  const saveToFile = req.query.save === 'true';
  const filename = generateFilename('leads', query);

  await streamCursorToResponse(cursor, res, { saveToFile, filename, query });
});

export const listExportsController = asyncHandler(async (req: Request, res: Response) => {
  const exports = await listExports();
  res.json({ exports });
});

export const downloadExportController = asyncHandler(async (req: Request, res: Response) => {
  const csv = await getExportFile(req.params.filename);
  
  // Log the download
  await AuditService.log('EXPORT_DOWNLOAD', 'leads', req.user?.id, req.user?.role, {
    filename: req.params.filename
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${req.params.filename}"`);
  res.send(csv);
});
