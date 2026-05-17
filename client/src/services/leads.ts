import api from './api';

export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Lost';
export type LeadSource = 'Website' | 'Instagram' | 'Referral';

export type Lead = {
  _id: string;
  name: string;
  email: string;
  status: LeadStatus;
  source: LeadSource;
  createdAt: string;
  updatedAt: string;
};

export type LeadPayload = {
  name: string;
  email: string;
  status?: LeadStatus;
  source?: LeadSource;
};

export type LeadListQuery = {
  status?: LeadStatus;
  source?: LeadSource;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'email' | 'status' | 'source' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
};

export type LeadListResponse = {
  leads: Lead[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type LeadAnalyticsResponse = {
  byStatus: Record<string, number>;
  bySource: Record<string, number>;
  timeseries: Array<{ _id: string; count: number }>;
};

export type ExportFileRecord = {
  filename: string;
  createdAt: string;
};

export const leadsService = {
  async getAll(params: LeadListQuery = {}) {
    const res = await api.get<LeadListResponse>('/v1/leads', { params });
    return res.data;
  },
  async getById(id: string) {
    const res = await api.get<{ lead: Lead }>(`/v1/leads/${id}`);
    return res.data.lead;
  },
  async create(data: LeadPayload) {
    const res = await api.post<{ lead: Lead }>('/v1/leads', data);
    return res.data.lead;
  },
  async update(id: string, data: LeadPayload) {
    const res = await api.patch<{ lead: Lead }>(`/v1/leads/${id}`, data);
    return res.data.lead;
  },
  async remove(id: string) {
    await api.delete(`/v1/leads/${id}`);
  },
  async getAnalytics(params: LeadListQuery = {}) {
    const res = await api.get<LeadAnalyticsResponse>('/v1/leads/analytics', { params });
    return res.data;
  },
  async exportCSV(params: LeadListQuery = {}) {
    const res = await api.get('/v1/leads/export', { params, responseType: 'blob' });
    const disposition = (res.headers && (res.headers['content-disposition'] || res.headers['Content-Disposition'])) || '';
    const m = disposition.match(/filename="?([^";]+)"?/);
    const filename = m ? m[1] : `leads-export-${new Date().toISOString().slice(0, 10)}.csv`;
    return { blob: res.data, filename };
  },
  async listExports() {
    const res = await api.get<{ exports: ExportFileRecord[] }>('/v1/leads/exports');
    return res.data.exports;
  },
  async downloadExport(filename: string) {
    const res = await api.get(`/v1/leads/exports/download/${filename}`, { responseType: 'blob' });
    return res.data;
  }
};

export default leadsService;
