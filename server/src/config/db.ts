import mongoose from 'mongoose';

let fallbackMongoServer: any = null;

function isLocalMongoUri(uri: string) {
  return /^mongodb:\/\/(localhost|127\.0\.0\.1|::1)(:\\d+)?\//i.test(uri);
}

export async function connectDB(uri: string) {
  mongoose.set('strictQuery', true);

  if (!uri) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('MONGO_URI must be defined in production');
    }

    // Start an in-memory MongoDB for local development when no URI is provided.
    // dynamic import so production images (which don't install dev deps) don't fail
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    fallbackMongoServer ??= await MongoMemoryServer.create();
    const memUri = fallbackMongoServer.getUri();
    await mongoose.connect(memUri, { serverSelectionTimeoutMS: 5000 });
    // eslint-disable-next-line no-console
    console.warn('No MONGO_URI provided; started in-memory MongoDB for development');
    return;
  }

  const isMongoUri = uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://');
  if (!isMongoUri) {
    throw new Error('MONGO_URI must start with mongodb:// or mongodb+srv://');
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    return;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production' && isLocalMongoUri(uri)) {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      fallbackMongoServer ??= await MongoMemoryServer.create();
      await mongoose.connect(fallbackMongoServer.getUri());
      console.warn('Local MongoDB was unavailable; started in-memory MongoDB fallback');
      return;
    }

    throw error;
  }
}

export async function disconnectDB() {
  try {
    await mongoose.disconnect();
  } finally {
    if (fallbackMongoServer) {
      try {
        await fallbackMongoServer.stop();
      } catch (_err) {
        // ignore
      }
      fallbackMongoServer = null;
    }
  }
}

export default mongoose;
