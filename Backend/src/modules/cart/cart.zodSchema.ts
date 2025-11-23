// src/modules/cart/cart.zodSchema.ts
import { preprocess, z } from "zod";
// Validate MongoDB ObjectId (for user & product)
const objectIdSchema = z.string().refine(
  (val) => /^[0-9a-fA-F]{24}$/.test(val),
  { message: "Invalid ObjectId format" }
);

export const itemSchema = z.object({
  productId: z.string({ message: "Product ID is required" })
    .trim()
    .min(3),

  productObjectId: objectIdSchema,

  //productName: z.string().trim().min(1),

  //pricePerUnit: z.number().min(1, { message: "Price must be at least 1" }),

  quantity: z.number().min(1).max(100, {
    message: "For bulk orders over 100, contact admin",
  }),

  //productImage: z.string().optional(),
  size: z.string().optional(),
  color: z.string().optional(),
});

export const addToCartSchema = z.object({
  userId: objectIdSchema,      // required (logged in users only)
  items: z.array(itemSchema),  // <-- array of items
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
