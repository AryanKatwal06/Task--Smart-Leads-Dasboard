function passthroughMiddleware() {
  return (...args: unknown[]) => {
    const next = args[2];
    if (typeof next === 'function') {
      (next as () => void)();
    }
  };
}

jest.mock('../middlewares/auth', () => ({
  protect: passthroughMiddleware(),
  authorize: passthroughMiddleware()
}));

jest.mock('../middlewares/role', () => ({
  __esModule: true,
  authorize: () => passthroughMiddleware(),
  default: {
    authorize: () => passthroughMiddleware()
  }
}));

import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../app';
import { LeadModel } from '../models/lead.model';

type LeadRecord = {
  _id: string;
  name: string;
  email: string;
  status: string;
  source: string;
  createdAt: string;
  updatedAt: string;
};

type LeadListResponse = {
  leads: LeadRecord[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

describe('Filtering and pagination combinations', () => {
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri, { dbName: 'test' });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongod) await mongod.stop();
  });

  beforeEach(async () => {
    await LeadModel.deleteMany({});
    const docs = [];
    for (let i = 1; i <= 23; i++) {
      docs.push({
        name: `Lead ${i}`,
        email: `lead${i}@example.com`,
        status: i % 3 === 0 ? 'Qualified' : i % 2 === 0 ? 'Contacted' : 'New',
        source: i % 2 === 0 ? 'Website' : 'Referral'
      });
    }
    await LeadModel.insertMany(docs);
  });

  it('filters by status and source together', async () => {
    const res = await request(app).get('/api/v1/leads').query({ status: 'Contacted', source: 'Website', limit: 50 });
    expect(res.status).toBe(200);
    const body = res.body as LeadListResponse;
    expect(body.leads.every((lead) => lead.status === 'Contacted' && lead.source === 'Website')).toBeTruthy();
  });

  it('filters by source and search', async () => {
    // Lead 2 is Website and should match
    const res = await request(app).get('/api/v1/leads').query({ source: 'Website', search: 'Lead 2', limit: 10 });
    expect(res.status).toBe(200);
    const body = res.body as LeadListResponse;
    expect(body.meta.total).toBeGreaterThanOrEqual(1);
    expect(body.leads.every((lead) => lead.source === 'Website')).toBeTruthy();
  });

  it('applies status+source+search+sorting correctly', async () => {
    const res = await request(app).get('/api/v1/leads').query({ status: 'New', source: 'Referral', search: 'Lead', sortBy: 'name', sortOrder: 'desc', limit: 5 });
    expect(res.status).toBe(200);
    const body = res.body as LeadListResponse;
    const names = body.leads.map((lead) => lead.name);
    const sorted = [...names].sort().reverse();
    expect(names).toEqual(sorted);
    expect(body.leads.every((lead) => lead.status === 'New' && lead.source === 'Referral')).toBeTruthy();
  });

  it('returns empty array for page beyond last page with correct meta', async () => {
    const res1 = await request(app).get('/api/v1/leads').query({ page: 1, limit: 10 });
    expect(res1.status).toBe(200);
    const totalPages = res1.body.meta.totalPages;

    const res2 = await request(app).get('/api/v1/leads').query({ page: totalPages + 5, limit: 10 });
    expect(res2.status).toBe(200);
    expect(Array.isArray(res2.body.leads)).toBeTruthy();
    expect(res2.body.leads.length).toBe(0);
    expect(res2.body.meta.page).toBe(totalPages + 5);
  });
});
