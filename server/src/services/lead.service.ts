import ApiError from '../utils/ApiError';
import LeadRepository, { CreateLeadInput, FindLeadsQuery, UpdateLeadInput, findForExport } from '../repositories/lead.repository';
import { LeadModel, ILead } from '../models/lead.model';

type AnalyticsMatch = Record<string, unknown> & {
  $or?: Array<Record<string, unknown>>;
  createdAt?: { $gte?: Date; $lte?: Date };
};

export const LeadService = {
  async createLead(data: CreateLeadInput) {
    return LeadRepository.create(data);
  },

  async getAllLeads(query: FindLeadsQuery) {
    return LeadRepository.findAll(query);
  },

  async getLeadById(id: string) {
    const lead = await LeadRepository.findById(id);
    if (!lead) throw new ApiError(404, 'Lead not found');
    return lead;
  },

  async updateLead(id: string, data: UpdateLeadInput) {
    const lead = await LeadRepository.updateById(id, data);
    if (!lead) throw new ApiError(404, 'Lead not found');
    return lead;
  },

  async deleteLead(id: string) {
    const lead = await LeadRepository.deleteById(id);
    if (!lead) throw new ApiError(404, 'Lead not found');
    return lead;
  },
  async getAnalytics(query: FindLeadsQuery) {
    const match: AnalyticsMatch = {};
    if (query.status) match.status = query.status;
    if (query.source) match.source = query.source;
    if (query.search) {
      const regex = new RegExp(query.search, 'i');
      match.$or = [{ name: regex }, { email: regex }];
    }
    if (query.startDate || query.endDate) {
      const createdAtFilter: { $gte?: Date; $lte?: Date } = {};
      if (query.startDate) createdAtFilter.$gte = new Date(query.startDate);
      if (query.endDate) createdAtFilter.$lte = new Date(query.endDate);
      match.createdAt = createdAtFilter;
    }

    const [byStatus, bySource, timeseries] = await Promise.all([
      LeadModel.aggregate([
        { $match: match },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]).exec(),
      LeadModel.aggregate([
        { $match: match },
        { $group: { _id: '$source', count: { $sum: 1 } } }
      ]).exec(),
      LeadModel.aggregate([
        { $match: match },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]).exec()
    ]);

    const byStatusMap = byStatus.reduce((acc: Record<string, number>, cur: { _id?: string; count: number }) => {
      acc[cur._id ?? 'unknown'] = cur.count; return acc;
    }, {});
    const bySourceMap = bySource.reduce((acc: Record<string, number>, cur: { _id?: string; count: number }) => {
      acc[cur._id ?? 'unknown'] = cur.count; return acc;
    }, {});

    return {
      byStatus: byStatusMap,
      bySource: bySourceMap,
      timeseries
    };
  },

  async exportLeads(query: FindLeadsQuery) {
    const leads = await findForExport(query);
    // Build CSV string header
    const header = ['id', 'name', 'email', 'status', 'source', 'createdAt', 'updatedAt'];
    const rows = leads.map((l: ILead) => [
      l._id?.toString(),
      l.name,
      l.email,
      l.status,
      l.source,
      l.createdAt?.toISOString(),
      l.updatedAt?.toISOString()
    ]);

    const csv = [header, ...rows]
      .map(r => r.map(cell => (cell ?? '').toString().replace(/"/g, '""')).map(c => `"${c}"`).join(','))
      .join('\n');
    return csv;
  }
};

export async function listExports() {
  const fs = await import('fs').then(m => m.default);
  const path = await import('path').then(m => m.default);
  const exportsDir = path.resolve(process.cwd(), 'exports');
  if (!fs.existsSync(exportsDir)) return [];
  const files = fs.readdirSync(exportsDir);
  return files.map(f => ({
    filename: f,
    path: `/v1/leads/exports/download/${f}`,
    createdAt: fs.statSync(path.join(exportsDir, f)).birthtime
  }));
}

export async function getExportFile(filename: string) {
  const fs = await import('fs').then(m => m.default);
  const path = await import('path').then(m => m.default);
  const exportsDir = path.resolve(process.cwd(), 'exports');
  const filepath = path.join(exportsDir, filename);
  // Prevent directory traversal - resolve and ensure the file is inside exportsDir
  const realExportsDir = path.resolve(exportsDir);
  const realFilePath = path.resolve(filepath);
  const relative = path.relative(realExportsDir, realFilePath);
  if (relative.startsWith('..') || path.isAbsolute(relative)) throw new ApiError(403, 'Forbidden');
  if (!fs.existsSync(filepath)) throw new ApiError(404, 'Export file not found');
  return fs.readFileSync(filepath, 'utf8');
}

export default LeadService;
