import { createClient, RedisClientType } from 'redis';
import { logger } from './logger';

let redisClient: RedisClientType | null = null;
let redisConnectPromise: Promise<RedisClientType | null> | null = null;
let redisUnavailable = false;

const isTestEnv = process.env.NODE_ENV === 'test';

export async function connectRedis() {
  if (isTestEnv || redisUnavailable) {
    redisClient = null;
    return null;
  }

  if (redisClient) {
    return redisClient;
  }

  if (redisConnectPromise) {
    return redisConnectPromise;
  }

  redisConnectPromise = (async () => {
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      redisClient = createClient({
        url: redisUrl,
        socket: {
          reconnectStrategy: () => false
        }
      });
      redisClient.on('error', (err) => logger.error('Redis error', err));
      await redisClient.connect();
      logger.info('Connected to Redis');
      return redisClient;
    } catch (err) {
      logger.warn('Redis unavailable, continuing without cache', err);
      redisUnavailable = true;
      redisClient = null;
      return null;
    } finally {
      redisConnectPromise = null;
    }
  })();

  return redisConnectPromise;
}

export async function getRedisClient(): Promise<RedisClientType | null> {
  if (isTestEnv || redisUnavailable) {
    return null;
  }

  if (!redisClient) {
    return connectRedis();
  }
  return redisClient;
}

export async function setCache(key: string, value: unknown, ttl = 3600) {
  try {
    const client = await getRedisClient();
    if (client) {
      await client.setEx(key, ttl, JSON.stringify(value));
    }
  } catch (err) {
    logger.error('Cache set failed', err);
  }
}

export async function getCache(key: string) {
  try {
    const client = await getRedisClient();
    if (client) {
      const val = await client.get(key);
      return val ? JSON.parse(val) : null;
    }
  } catch (err) {
    logger.error('Cache get failed', err);
  }
  return null;
}

export async function deleteCache(key: string) {
  try {
    const client = await getRedisClient();
    if (client) {
      await client.del(key);
    }
  } catch (err) {
    logger.error('Cache delete failed', err);
  }
}

export async function clearCache(pattern: string) {
  try {
    const client = await getRedisClient();
    if (client) {
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(keys);
      }
    }
  } catch (err) {
    logger.error('Cache clear failed', err);
  }
}

export default { connectRedis, getRedisClient, setCache, getCache, deleteCache, clearCache };
