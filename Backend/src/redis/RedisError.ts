// src/redis/RedisError.ts
export class RedisError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'RedisError';
  }
}

export async function safeRedis<T>(
  action: () => Promise<T>,
  fallback: T | null = null
): Promise<T | null> {
  try {
    return await action();
  } catch (err) {
    console.error("❌ Redis Operation Failed:", err);
    return fallback;
  }
}

// Enhanced version with more options
export async function safeRedisWithOptions<T>(
  action: () => Promise<T>,
  options: {
    fallback?: T | null;
    logError?: boolean;
    throwError?: boolean;
    customErrorMessage?: string;
  } = {}
): Promise<T | null> {
  const {
    fallback = null,
    logError = true,
    throwError = false,
    customErrorMessage
  } = options;

  try {
    return await action();
  } catch (err) {
    const errorMessage = customErrorMessage || "Redis Operation Failed";
    
    if (logError) {
      console.error(`❌ ${errorMessage}:`, err);
    }

    if (throwError) {
      throw new RedisError(`${errorMessage}: ${err instanceof Error ? err.message : String(err)}`);
    }

    return fallback;
  }
}