// src/config/redisConfig.ts - Fixed version
import Redis, { Redis as RedisClient, RedisOptions } from "ioredis";

export const REDIS_CONFIG: RedisOptions = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || "0"),

  // Essential options only
  connectTimeout: 10000,
  commandTimeout: 5000,
  lazyConnect: true, // Changed to true to prevent auto-connect

  // Simple retry strategy
  retryStrategy(times: number) {
    if (times > 20) return null;
    return Math.min(times * 50, 2000);
  },
};

class RedisConnection {
  private client: RedisClient;
  private isConnecting: boolean = false;
  private connectionPromise: Promise<void> | null = null;

  constructor() {
    this.client = new Redis(REDIS_CONFIG);
    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.client.on("connect", () => console.log("🟢 Redis connecting..."));
    this.client.on("ready", () => console.log("✅ Redis connected and ready"));
    this.client.on("error", (err) =>
      console.error("❌ Redis error:", err.message)
    );
    this.client.on("close", () => console.log("🔴 Redis connection closed"));
    this.client.on("reconnecting", () =>
      console.log("🔄 Redis reconnecting...")
    );
  }

  async connect(): Promise<void> {
    if (this.client.status === "ready") return;
    if (this.connectionPromise) return this.connectionPromise;

    this.isConnecting = true;
    
    this.connectionPromise = (async () => {
      try {
        await this.client.connect();
        console.log("✅ Redis connection established");
      } catch (error) {
        console.error("Failed to connect to Redis:", error);
        this.connectionPromise = null;
        this.isConnecting = false;
        throw error;
      }
    })();

    return this.connectionPromise;
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.quit();
    } catch (error) {
      console.error("Error disconnecting from Redis:", error);
      this.client.disconnect();
    } finally {
      this.connectionPromise = null;
      this.isConnecting = false;
    }
  }

  getClient(): RedisClient {
    if (this.client.status !== "ready") {
      throw new Error(`Redis not ready. Status: ${this.client.status}. Call await redisConnection.connect() first.`);
    }
    return this.client;
  }

  // Safe method to get client that waits for connection
  async getSafeClient(): Promise<RedisClient> {
    if (this.client.status !== "ready") {
      await this.connect();
    }
    return this.client;
  }

  isReady(): boolean {
    return this.client.status === "ready";
  }

  async ping(): Promise<string | null> {
    try {
      const client = await this.getSafeClient();
      return await client.ping();
    } catch (error) {
      console.error("Redis ping failed:", error);
      return null;
    }
  }

  // Add this method for health checks
  getStatus(): string {
    return this.client.status;
  }

  // Wait for connection to be ready
  async waitForReady(): Promise<void> {
    if (this.isReady()) return;
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Redis connection timeout"));
      }, 10000);

      const checkReady = () => {
        if (this.isReady()) {
          clearTimeout(timeout);
          this.client.off('ready', checkReady);
          this.client.off('error', onError);
          resolve();
        }
      };

      const onError = (err: Error) => {
        clearTimeout(timeout);
        this.client.off('ready', checkReady);
        this.client.off('error', onError);
        reject(err);
      };

      this.client.on('ready', checkReady);
      this.client.on('error', onError);
    });
  }
}

export const redisConnection = new RedisConnection();