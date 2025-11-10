// src/utils/redisUtils.ts
import { Redis } from 'ioredis';
import { redisConnection } from '../config/redisConfig';

// Cache expiration times (in seconds)
export const CACHE_EXPIRATION = {
  TEXT_DATA: 3600, // 1 hour
  SHORT_LIVED: 300, // 5 minutes
  LONG_LIVED: 86400, // 24 hours
};

export class CacheService {
  private get client(): Redis {
    return redisConnection.getClient();
  }

  // Set cache with expiration
  async set(key: string, value: any, expiration: number = CACHE_EXPIRATION.TEXT_DATA): Promise<void> {
    try {
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
      
      if (expiration > 0) {
        await this.client.setex(key, expiration, serializedValue);
      } else {
        await this.client.set(key, serializedValue);
      }
    } catch (error) {
      console.error('Redis set error:', error);
      // Don't throw error - fail silently for cache failures
    }
  }

  // Get cache data
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      
      if (!value) return null;

      // Try to parse as JSON, if fails return as string
      try {
        return JSON.parse(value) as T;
      } catch {
        return value as T;
      }
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  // Delete cache
  async delete(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      console.error('Redis delete error:', error);
    }
  }

  // Delete multiple keys by pattern
  async deleteByPattern(pattern: string): Promise<void> {
    try {
      const stream = this.client.scanStream({
        match: pattern,
        count: 100
      });

      const keysToDelete: string[] = [];

      await new Promise<void>((resolve, reject) => {
        stream.on('data', (keys: string[]) => {
          if (keys.length) {
            keysToDelete.push(...keys);
          }
        });
        
        stream.on('end', () => resolve());
        stream.on('error', (err) => reject(err));
      });

      if (keysToDelete.length > 0) {
        await this.client.del(...keysToDelete);
        console.log(`🗑️ Deleted ${keysToDelete.length} keys matching pattern: ${pattern}`);
      }
    } catch (error) {
      console.error('Redis delete pattern error:', error);
    }
  }

  // Check if key exists
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Redis exists error:', error);
      return false;
    }
  }

  // Get multiple keys
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      const values = await this.client.mget(...keys);
      return values.map(value => {
        if (!value) return null;
        try {
          return JSON.parse(value) as T;
        } catch {
          return value as T;
        }
      });
    } catch (error) {
      console.error('Redis mget error:', error);
      return keys.map(() => null);
    }
  }

  // Set multiple keys
  async mset(data: { key: string; value: any; expiration?: number }[]): Promise<void> {
    try {
      const pipeline = this.client.pipeline();
      
      data.forEach(({ key, value, expiration }) => {
        const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
        
        if (expiration && expiration > 0) {
          pipeline.setex(key, expiration, serializedValue);
        } else {
          pipeline.set(key, serializedValue);
        }
      });
      
      await pipeline.exec();
    } catch (error) {
      console.error('Redis mset error:', error);
    }
  }

  // Get TTL (Time To Live) for a key
  async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      console.error('Redis ttl error:', error);
      return -2; // Key doesn't exist
    }
  }

  // Extend TTL for a key
  async expire(key: string, seconds: number): Promise<boolean> {
    try {
      const result = await this.client.expire(key, seconds);
      return result === 1;
    } catch (error) {
      console.error('Redis expire error:', error);
      return false;
    }
  }

  // Increment counter
  async incr(key: string): Promise<number> {
    try {
      return await this.client.incr(key);
    } catch (error) {
      console.error('Redis incr error:', error);
      return 0;
    }
  }

  // Increment counter by specific amount
  async incrby(key: string, increment: number): Promise<number> {
    try {
      return await this.client.incrby(key, increment);
    } catch (error) {
      console.error('Redis incrby error:', error);
      return 0;
    }
  }
}

export const cacheService = new CacheService();

// Cache key generators
export const cacheKeys = {
  text: {
    full: () => 'text:full',
    fields: (fields: string[]) => `text:fields:${fields.sort().join(':')}`,
    all: () => 'text:all',
    byId: (id: string) => `text:${id}`,
  },
};