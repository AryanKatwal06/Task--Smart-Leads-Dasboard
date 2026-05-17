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

function parseCsvIds(csvText: string) {
  const lines = csvText.trim().split('\n');
  // header + rows
  const rows = lines.slice(1);
  return rows.map(r => {
    // naive CSV split by comma, id is first column and may be quoted
    const cols = r.split(',');
    return cols[0].replace(/^"|"$/g, '');
  });
}

describe('GET /api/v1/leads/export - CSV export matches filtered data', () => {
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
    for (let i = 1; i <= 15; i++) {
      docs.push({
        name: `Lead ${i}`,
        email: `lead${i}@example.com`,
        status: i % 2 === 0 ? 'Contacted' : 'New',
        source: i % 3 === 0 ? 'Instagram' : 'Website'
      });
    }
    await LeadModel.insertMany(docs);
  });

  it('exports only filtered leads and matches repository results', async () => {
    // filter: status=Contacted, source=Website
    const res = await request(app).get('/api/v1/leads/export').query({ status: 'Contacted', source: 'Website' });
    expect(res.status).toBe(200);
    const csv = res.text;
    const exportedIds = parseCsvIds(csv);

    // query DB directly with same filters
    const dbLeads = await LeadModel.find({ status: 'Contacted', source: 'Website' }).sort({ createdAt: -1 }).exec();
    const dbIds = dbLeads.map(d => d._id.toString());

    expect(exportedIds.length).toBe(dbIds.length);
    // Compare as sets (order may differ depending on sort), but most exports use createdAt desc by default
    expect(new Set(exportedIds)).toEqual(new Set(dbIds));
  });
});
