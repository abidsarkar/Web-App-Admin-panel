// src/config/redisConfig.ts - Improved minimal version
import Redis, { Redis as RedisClient, RedisOptions } from 'ioredis';

export const REDIS_CONFIG: RedisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  //password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  
  // Essential options only
  connectTimeout: 10000,
  commandTimeout: 5000,
  lazyConnect: true,
  
  // Simple retry strategy
  retryStrategy(times: number) {
    return Math.min(times * 50, 2000);
  }
};

class RedisConnection {
  private client: RedisClient;

  constructor() {
    this.client = new Redis(REDIS_CONFIG);
    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.client.on('connect', () => console.log('🟢 Redis connecting...'));
    this.client.on('ready', () => console.log('✅ Redis connected and ready'));
    this.client.on('error', (err) => console.error('❌ Redis error:', err.message));
    this.client.on('close', () => console.log('🔴 Redis connection closed'));
    this.client.on('reconnecting', () => console.log('🔄 Redis reconnecting...'));
  }

  async connect(): Promise<void> {
    if (this.client.status === 'ready') return;
    
    try {
      await this.client.connect();
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.quit();
    } catch (error) {
      console.error('Error disconnecting from Redis:', error);
      this.client.disconnect();
    }
  }

  getClient(): RedisClient {
    if (this.client.status !== 'ready') {
      throw new Error(`Redis not ready. Status: ${this.client.status}`);
    }
    return this.client;
  }

  isReady(): boolean {
    return this.client.status === 'ready';
  }

  async ping(): Promise<string | null> {
    try {
      if (this.isReady()) {
        return await this.client.ping();
      }
      return null;
    } catch (error) {
      console.error('Redis ping failed:', error);
      return null;
    }
  }

  // Add this method for health checks
  getStatus(): string {
    return this.client.status;
  }
}

export const redisConnection = new RedisConnection();