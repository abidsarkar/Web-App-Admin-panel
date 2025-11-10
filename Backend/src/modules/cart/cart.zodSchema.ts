// src/modules/cart/cart.zodSchema.ts
import { z } from "zod";

export const addToCartSchema = z.object({
  productId: z.string({ message: "Product ID is required" }).trim().min(1),
  quantity: z.number({ message: "Quantity is required" }).min(1).max(100),
  size: z.string().trim().optional(),
  color: z.string().trim().optional(),
  colorCode: z.string().trim().optional(),
});

export const updateCartItemSchema = z.object({
  productId: z.string({ message: "Product ID is required" }).trim().min(1),
  quantity: z.number({ message: "Quantity is required" }).min(0).max(100),
  size: z.string().trim().optional(),
  color: z.string().trim().optional(),
});

export const removeFromCartSchema = z.object({
  productId: z.string({ message: "Product ID is required" }).trim().min(1),
  size: z.string().trim().optional(),
  color: z.string().trim().optional(),
});

export const mergeCartsSchema = z.object({
  sessionId: z.string({ message: "Session ID is required" }).trim().min(1),
});