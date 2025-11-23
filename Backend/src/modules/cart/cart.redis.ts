// src/modules/cart/cart.redis.ts

import { redisConnection } from "../../redis/redisConfig";
import { safeRedis } from "../../redis/RedisError";

/* ----------------------- Cache Keys ----------------------- */
export const cartCacheKeys = {
  // User's full cart
  userCart: (userId: string) => `cart:user:${userId}`,
  
  // Cart items separately for granular control
  cartItems: (userId: string) => `cart:items:${userId}`,
  
  // Cart summary (total items, total price, etc.)
  cartSummary: (userId: string) => `cart:summary:${userId}`,
  
  // Product availability cache
  productAvailability: (productId: string) => `cart:product:${productId}:availability`,
  
  // Pattern for bulk deletion
  userCartPattern: (userId: string) => `cart:*:${userId}*`,
  
  // All carts pattern (for admin operations)
  allCartsPattern: "cart:*",
};

/* ----------------------- Safe Client Getter ----------------------- */
const getClient = async () => {
  return await redisConnection.getSafeClient();
};

/* ----------------------- SET ----------------------- */
export const cartCacheSet = async (key: string, value: any, ttl: number = 3600) =>
  safeRedis(async () => {
    const client = await getClient();
    await client.set(key, JSON.stringify(value), "EX", ttl);
  });

/* ----------------------- GET ----------------------- */
export const cartCacheGet = async <T>(key: string) =>
  safeRedis<T | null>(async () => {
    const client = await getClient();
    const raw = await client.get(key);
    return raw ? JSON.parse(raw) : null;
  });

/* ----------------------- DELETE ----------------------- */
export const cartCacheDelete = async (key: string) =>
  safeRedis(async () => {
    const client = await getClient();
    await client.del(key);
  });

/* ----------------------- DELETE BY PATTERN ----------------------- */
export const cartCacheDeletePattern = async (pattern: string) =>
  safeRedis(async () => {
    const client = await getClient();
    const keys = await client.keys(pattern);
    if (keys.length) await client.del(...keys);
    return keys.length;
  });

/* ----------------------- CART SPECIFIC OPERATIONS ----------------------- */

/**
 * Cache user's full cart data
 */
export const cacheUserCart = async (userId: string, cartData: any, ttl: number = 3600) =>
  safeRedis(async () => {
    const client = await getClient();
    const key = cartCacheKeys.userCart(userId);
    await client.set(key, JSON.stringify(cartData), "EX", ttl);
  });

/**
 * Get user's cached cart
 */
export const getCachedUserCart = async <T>(userId: string) =>
  safeRedis<T | null>(async () => {
    const client = await getClient();
    const key = cartCacheKeys.userCart(userId);
    const raw = await client.get(key);
    return raw ? JSON.parse(raw) : null;
  });

/**
 * Cache product availability (price, stock, etc.)
 */
export const cacheProductAvailability = async (
  productId: string, 
  availabilityData: any, 
  ttl: number = 1800 // 30 minutes for product data
) => safeRedis(async () => {
  const client = await getClient();
  const key = cartCacheKeys.productAvailability(productId);
  await client.set(key, JSON.stringify(availabilityData), "EX", ttl);
});

/**
 * Get cached product availability
 */
export const getCachedProductAvailability = async <T>(productId: string) =>
  safeRedis<T | null>(async () => {
    const client = await getClient();
    const key = cartCacheKeys.productAvailability(productId);
    const raw = await client.get(key);
    return raw ? JSON.parse(raw) : null;
  });

/**
 * Invalidate all cart cache for a user
 * Useful when cart is modified (add, update, remove items)
 */
export const invalidateUserCartCache = async (userId: string) =>
  safeRedis(async () => {
    const client = await getClient();
    const patterns = [
      cartCacheKeys.userCart(userId),
      cartCacheKeys.cartItems(userId),
      cartCacheKeys.cartSummary(userId),
    ];
    
    for (const pattern of patterns) {
      await client.del(pattern);
    }
  });

/**
 * Invalidate specific product availability cache
 * Useful when product price/stock changes
 */
export const invalidateProductAvailability = async (productId: string) =>
  safeRedis(async () => {
    const client = await getClient();
    const key = cartCacheKeys.productAvailability(productId);
    await client.del(key);
  });

/**
 * Bulk invalidate multiple products availability
 */
export const invalidateProductsAvailability = async (productIds: string[]) =>
  safeRedis(async () => {
    const client = await getClient();
    const keys = productIds.map(id => cartCacheKeys.productAvailability(id));
    if (keys.length) await client.del(...keys);
  });

/* ----------------------- HASH OPERATIONS (for cart items) ----------------------- */

/**
 * Cache individual cart items using Redis Hash
 * Useful for granular updates
 */
export const cacheCartItemsHash = async (userId: string, items: any[], ttl: number = 3600) =>
  safeRedis(async () => {
    const client = await getClient();
    const key = cartCacheKeys.cartItems(userId);
    
    // Convert items to hash field-value pairs
    const itemMap: { [key: string]: string } = {};
    items.forEach((item, index) => {
      itemMap[`item_${index}`] = JSON.stringify(item);
    });
    
    if (Object.keys(itemMap).length > 0) {
      await client.hset(key, itemMap);
      await client.expire(key, ttl);
    }
  });

/**
 * Get cached cart items from hash
 */
export const getCachedCartItemsHash = async <T>(userId: string) =>
  safeRedis<T[] | null>(async () => {
    const client = await getClient();
    const key = cartCacheKeys.cartItems(userId);
    const itemsHash = await client.hgetall(key);
    
    if (Object.keys(itemsHash).length === 0) return null;
    
    return Object.values(itemsHash).map(item => JSON.parse(item));
  });

/**
 * Update specific item in cart hash
 */
export const updateCachedCartItem = async (
  userId: string, 
  itemIndex: number, 
  itemData: any, 
  ttl: number = 3600
) => safeRedis(async () => {
  const client = await getClient();
  const key = cartCacheKeys.cartItems(userId);
  await client.hset(key, `item_${itemIndex}`, JSON.stringify(itemData));
  await client.expire(key, ttl);
});