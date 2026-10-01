import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL || "";

interface GlobalWithRedis {
  _redisClient?: Redis;
}

const globalWithRedis = globalThis as unknown as GlobalWithRedis;

export function getRedisClient(): Redis | null {
  if (!redisUrl) {
    return null;
  }

  if (!globalWithRedis._redisClient) {
    try {
      const client = new Redis(redisUrl, {
        maxRetriesPerRequest: 2,
        connectTimeout: 5000,
        lazyConnect: false,
        retryStrategy(times) {
          if (times > 3) {
            return null; // Stop retrying after 3 attempts to prevent blocking
          }
          return Math.min(times * 100, 2000);
        },
      });

      client.on("error", (err) => {
        console.warn("Redis client error:", (err as Error).message);
      });

      globalWithRedis._redisClient = client;
    } catch (err) {
      console.warn("Redis initialization failed:", (err as Error).message);
      return null;
    }
  }

  return globalWithRedis._redisClient;
}

/**
 * Retrieve cached JSON data from Redis by key
 */
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const client = getRedisClient();
    if (!client) return null;

    const data = await client.get(key);
    if (!data) return null;

    return JSON.parse(data) as T;
  } catch (err) {
    console.warn(`Redis getCache error for key "${key}":`, (err as Error).message);
    return null;
  }
}

/**
 * Store data as JSON in Redis with an optional TTL (default 1 hour = 3600 seconds)
 */
export async function setCache<T>(
  key: string,
  data: T,
  ttlSeconds: number = 3600
): Promise<boolean> {
  try {
    const client = getRedisClient();
    if (!client) return false;

    const payload = JSON.stringify(data);
    if (ttlSeconds > 0) {
      await client.set(key, payload, "EX", ttlSeconds);
    } else {
      await client.set(key, payload);
    }
    return true;
  } catch (err) {
    console.warn(`Redis setCache error for key "${key}":`, (err as Error).message);
    return false;
  }
}

/**
 * Delete a cache key or keys matching a pattern
 */
export async function deleteCache(keyOrPattern: string): Promise<boolean> {
  try {
    const client = getRedisClient();
    if (!client) return false;

    if (keyOrPattern.includes("*")) {
      const keys = await client.keys(keyOrPattern);
      if (keys.length > 0) {
        await client.del(...keys);
      }
    } else {
      await client.del(keyOrPattern);
    }
    return true;
  } catch (err) {
    console.warn(`Redis deleteCache error for key "${keyOrPattern}":`, (err as Error).message);
    return false;
  }
}

/**
 * Invalidate caches for collections and spotlight
 */
export async function invalidateCollectionsCache(...collectionNames: string[]) {
  try {
    const client = getRedisClient();
    if (!client) return;

    if (collectionNames.length === 0) {
      const allColKeys = await client.keys("col:*");
      const allSpotKeys = await client.keys("spotlight:*");
      const toDelete = [...allColKeys, ...allSpotKeys];
      if (toDelete.length > 0) {
        await client.del(...toDelete);
      }
      return;
    }

    const keysToDelete: string[] = [];
    for (const name of collectionNames) {
      keysToDelete.push(`col:${name}`);
    }

    if (keysToDelete.length > 0) {
      await client.del(...keysToDelete);
    }
  } catch (err) {
    console.warn("Redis invalidateCollectionsCache error:", (err as Error).message);
  }
}

/**
 * Health check for Redis
 */
export async function checkRedisConnection(): Promise<{
  connected: boolean;
  ping?: string;
  error?: string;
}> {
  if (!redisUrl) {
    return {
      connected: false,
      error: "REDIS_URL is not configured in environment variables.",
    };
  }

  try {
    const client = getRedisClient();
    if (!client) {
      return {
        connected: false,
        error: "Unable to initialize Redis client.",
      };
    }
    const pong = await client.ping();
    return {
      connected: pong === "PONG",
      ping: pong,
    };
  } catch (err) {
    return {
      connected: false,
      error: (err as Error).message,
    };
  }
}
