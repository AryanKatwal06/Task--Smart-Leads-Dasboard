import api from './api';

export type SavedFilter = {
  _id: string;
  userId: string;
  name: string;
  status?: string;
  source?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: string;
  createdAt: string;
  updatedAt: string;
};

export const savedFiltersService = {
  async getAll() {
    const res = await api.get<{ filters: SavedFilter[] }>('/v1/saved-filters');
    return res.data.filters;
  },
  async create(data: Omit<SavedFilter, '_id' | 'userId' | 'createdAt' | 'updatedAt'>) {
    const res = await api.post<{ filter: SavedFilter }>('/v1/saved-filters', data);
    return res.data.filter;
  },
  async update(id: string, data: Partial<SavedFilter>) {
    const res = await api.patch<{ filter: SavedFilter }>(`/v1/saved-filters/${id}`, data);
    return res.data.filter;
  },
  async delete(id: string) {
    await api.delete(`/v1/saved-filters/${id}`);
  }
};

export const bulkImportService = {
  async uploadCSV(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/v1/bulk-import/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  }
};

export default { savedFiltersService, bulkImportService };
