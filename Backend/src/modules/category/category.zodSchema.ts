// src/validation/category.schema.ts
import { z } from "zod";

export const createCategorySchema = z.object({
  categoryName: z.string().trim().min(2).max(100),
  categoryId: z.string().trim().min(2).max(50),
});
export const updateCategorySchema = z.object({
  newCategoryName : z.string().trim().min(2).max(100).optional(),
  categoryId: z.string().trim().min(2).max(50),
  newCategoryId: z.string().trim().min(2).max(50).optional(),
});

export const createSubCategorySchema = z.object({
  subCategoryName: z.string().trim().min(2).max(100),
  subCategoryId: z.string().trim().min(2).max(50),
  categoryId: z.string().trim().min(2).max(50),
});
export const updateSubCategorySchema = z.object({
  subCategoryId: z.string().trim().min(2).max(50), // which subcategory to update
  subCategoryName: z.string().trim().min(2).max(100).optional(), // fields that can be updated
  categoryId: z.string().trim().min(2).max(50).optional(),
});
//!it update successfully but 3 problem 1) i cant update sub category id, new name 2)it not check where there is a categoryId valid or not,3) in the cateogory model it change and added to new cateogry but not deleted from old one