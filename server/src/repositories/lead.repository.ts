import { FilterQuery } from 'mongoose';
import { LeadModel, ILead, LeadStatus, LeadSource } from '../models/lead.model';

export type CreateLeadInput = {
  name: string;
  email: string;
  status?: LeadStatus;
  source?: LeadSource;
};

export type UpdateLeadInput = Partial<CreateLeadInput>;

export type FindLeadsQuery = {
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

export type LeadListResult = {
  leads: ILead[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export const LeadRepository = {
  async create(data: CreateLeadInput) {
    return LeadModel.create(data);
  },

  async findAll(query: FindLeadsQuery = {}): Promise<LeadListResult> {
    const parsedPage = Number(query.page);
    const parsedLimit = Number(query.limit);
    const page = Number.isFinite(parsedPage) && parsedPage > 0 ? Math.floor(parsedPage) : 1;
    const limit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? Math.min(Math.floor(parsedLimit), 100) : 10;
    const filter: FilterQuery<ILead> = {};

    if (query.status) filter.status = query.status;
    if (query.source) filter.source = query.source;
    if (query.search) {
      const search = query.search.trim();
      if (search) {
        const regex = new RegExp(escapeRegExp(search), 'i');
        filter.$or = [
          { name: regex },
          { email: regex }
        ];
      }
    }

    if (query.startDate || query.endDate) {
      type DateRange = { $gte?: Date; $lte?: Date };
      const createdAtFilter: DateRange = {};
      if (query.startDate) createdAtFilter.$gte = new Date(query.startDate);
      if (query.endDate) createdAtFilter.$lte = new Date(query.endDate);
      (filter as FilterQuery<ILead> & { createdAt?: DateRange }).createdAt = createdAtFilter;
    }

    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortBy]: sortOrder } as Record<string, 1 | -1>;

    const [total, leads] = await Promise.all([
      LeadModel.countDocuments(filter).exec(),
      LeadModel.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).exec()
    ]);

    return {
      leads,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  async findById(id: string) {
    return LeadModel.findById(id).exec();
  },

  async updateById(id: string, data: UpdateLeadInput) {
    return LeadModel.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec();
  },

  async deleteById(id: string) {
    return LeadModel.findByIdAndDelete(id).exec();
  }
};

export default LeadRepository;

export async function findForExport(query: FindLeadsQuery = {}): Promise<ILead[]> {
  const filter: FilterQuery<ILead> = {};
  if (query.status) filter.status = query.status;
  if (query.source) filter.source = query.source;
  if (query.search) {
    const search = query.search.trim();
    if (search) {
      const regex = new RegExp(escapeRegExp(search), 'i');
      filter.$or = [{ name: regex }, { email: regex }];
    }
  }
  if (query.startDate || query.endDate) {
    type DateRange = { $gte?: Date; $lte?: Date };
    const createdAtFilter: DateRange = {};
    if (query.startDate) createdAtFilter.$gte = new Date(query.startDate);
    if (query.endDate) createdAtFilter.$lte = new Date(query.endDate);
    (filter as FilterQuery<ILead> & { createdAt?: DateRange }).createdAt = createdAtFilter;
  }

  const sortBy = query.sortBy ?? 'createdAt';
  const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
  const sort = { [sortBy]: sortOrder } as Record<string, 1 | -1>;

  return LeadModel.find(filter).sort(sort).exec();
}

export function findForExportCursor(query: FindLeadsQuery = {}) {
  const filter: FilterQuery<ILead> = {};
  if (query.status) filter.status = query.status;
  if (query.source) filter.source = query.source;
  if (query.search) {
    const search = query.search.trim();
    if (search) {
      const regex = new RegExp(escapeRegExp(search), 'i');
      filter.$or = [{ name: regex }, { email: regex }];
    }
  }
  if (query.startDate || query.endDate) {
    type DateRange = { $gte?: Date; $lte?: Date };
    const createdAtFilter: DateRange = {};
    if (query.startDate) createdAtFilter.$gte = new Date(query.startDate);
    if (query.endDate) createdAtFilter.$lte = new Date(query.endDate);
    (filter as FilterQuery<ILead> & { createdAt?: DateRange }).createdAt = createdAtFilter;
  }

  const sortBy = query.sortBy ?? 'createdAt';
  const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
  const sort = { [sortBy]: sortOrder } as Record<string, 1 | -1>;

  return LeadModel.find(filter).sort(sort).cursor();
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
}
