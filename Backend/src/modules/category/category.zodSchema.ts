// src/validation/category.schema.ts
import { z } from "zod";

export const createCategorySchema = z.object({
  categoryName: z.string().trim().min(2).max(100),
  categoryId: z.string().trim().min(2).max(50),
});

export const createSubCategorySchema = z.object({
  subCategoryName: z.string().trim().min(2).max(100),
  subCategoryId: z.string().trim().min(2).max(50),
  categoryId: z.string().trim().min(2).max(50),
});
