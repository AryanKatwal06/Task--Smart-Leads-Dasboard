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

describe('GET /api/v1/leads - pagination and filters', () => {
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
    for (let i = 1; i <= 45; i++) {
      docs.push({
        name: `Lead ${i}`,
        email: `lead${i}@example.com`,
        status: i % 4 === 0 ? 'Lost' : i % 3 === 0 ? 'Qualified' : i % 2 === 0 ? 'Contacted' : 'New',
        source: i % 2 === 0 ? 'Website' : 'Referral'
      });
    }
    await LeadModel.insertMany(docs);
  });

  it('returns paginated results with metadata', async () => {
    const res = await request(app).get('/api/v1/leads').query({ page: 2, limit: 10 });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('leads');
    expect(res.body).toHaveProperty('meta');
    expect(res.body.meta.page).toBe(2);
    expect(res.body.meta.limit).toBe(10);
    expect(res.body.meta.total).toBe(45);
    expect(res.body.leads.length).toBe(10);
  });

  it('filters by status and search', async () => {
    const res = await request(app).get('/api/v1/leads').query({ status: 'New', search: 'Lead 1', limit: 5 });
    expect(res.status).toBe(200);
    const body = res.body as LeadListResponse;
    expect(body.meta.total).toBeGreaterThanOrEqual(1);
    expect(body.leads.every((lead) => lead.status === 'New')).toBeTruthy();
  });
});
