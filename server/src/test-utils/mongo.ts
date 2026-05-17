import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

// Use a loose type here because the memory server types can vary between
// environments and we only use this helper for tests.
let mongod: any = null;

export async function connectTestDb() {
  if (process.env.USE_REAL_MONGO === 'true') {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/test';
    await mongoose.connect(uri, { dbName: 'test' });
    return;
  }

  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri, { dbName: 'test' });
}

export async function disconnectTestDb() {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
    mongod = null;
  }
}

export async function clearTestDb() {
  const collections = Object.keys(mongoose.connection.collections);
  for (const name of collections) {
    const collection = mongoose.connection.collections[name];
    try {
      await collection.deleteMany({});
    } catch (err) {
      // ignore
    }
  }
}

export default { connectTestDb, disconnectTestDb, clearTestDb };
