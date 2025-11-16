// src/modules/text/text.redis.ts
import { redisConnection } from "../../redis/redisConfig";
import { safeRedis } from "../../redis/RedisError";

/* ----------------------- Cache Keys ----------------------- */
export const textCacheKeys = {
  full: "text:full",
  all: "text:all",
  fields: (fields: string[]) => `text:fields:${fields.sort().join(":")}`,
};

/* ----------------------- Safe Client Getter ----------------------- */
const getClient = async () => {
  return await redisConnection.getSafeClient();
};

/* ----------------------- SET ----------------------- */
export const textCacheSet = async (key: string, value: any, ttl: number = 3600) =>
  safeRedis(async () => {
    const client = await getClient();
    await client.set(key, JSON.stringify(value), "EX", ttl);
  });

/* ----------------------- GET ----------------------- */
export const textCacheGet = async <T>(key: string) =>
  safeRedis<T | null>(async () => {
    const client = await getClient();
    const raw = await client.get(key);
    return raw ? JSON.parse(raw) : null;
  });

/* ----------------------- DELETE ----------------------- */
export const textCacheDelete = async (key: string) =>
  safeRedis(async () => {
    const client = await getClient();
    await client.del(key);
  });

/* ----------------------- DELETE BY PATTERN ----------------------- */
export const textCacheDeletePattern = async (pattern: string) =>
  safeRedis(async () => {
    const client = await getClient();
    const keys = await client.keys(pattern);
    if (keys.length) await client.del(...keys);
    return keys.length;
  });