// src/validation/category.schema.ts
import { z } from "zod";

export const createCategorySchema = z.object({
  categoryName: z.string().trim().min(2).max(100),
  categoryId: z.string().trim().min(2).max(50),
  isDisplayed: z
    .preprocess((val) => {
      if (val === "true") return true;
      if (val === "false") return false;
      return val;
    }, z.boolean())
    .optional(),
});
//get category
export const getCategorySchema = z.object({
  isDisplayed: z
    .preprocess((val) => {
      if (val === "true") return true;
      if (val === "false") return false;
      return val;
    }, z.boolean())
    .optional(),
  categoryId: z.string().trim().min(2).max(50).optional(),
  subCategory: z
    .preprocess((val) => {
      if (val === "true") return true;
      if (val === "false") return false;
      return val;
    }, z.boolean())
    .optional(),
});
export const updateCategorySchema = z.object({
  isDisplayed: z
    .preprocess((val) => {
      if (val === "true") return true;
      if (val === "false") return false;
      return val;
    }, z.boolean())
    .optional(),
  newCategoryName: z.string().trim().min(2).max(100).optional(),
  _id: z.string().trim().min(2).max(100),
  newCategoryId: z.string().trim().min(2).max(50).optional(),
});
export const deleteCategorySchema = z.object({
  categoryId: z.string().trim().min(2).max(50),
});
//sub start
export const createSubCategorySchema = z.object({
  isDisplayed: z
    .preprocess((val) => {
      if (val === "true") return true;
      if (val === "false") return false;
      return val;
    }, z.boolean())
    .optional(),
  subCategoryName: z.string().trim().min(2).max(100),
  subCategoryId: z.string().trim().min(2).max(50),
  categoryId: z.string().trim().min(2).max(50),
});
export const updateSubCategorySchema = z.object({
  isDisplayed: z
    .preprocess((val) => {
      if (val === "true") return true;
      if (val === "false") return false;
      return val;
    }, z.boolean())
    .optional(),
  _id: z.string().trim().min(2).max(100),
  newSubCategoryId: z.string().trim().min(2).max(50).optional(), // which subcategory to update
  newSubCategoryName: z.string().trim().min(2).max(100).optional(), // fields that can be updated
  newCategoryId: z.string().trim().min(2).max(50).optional(),
});
export const getSubCategorySchema = z.object({
  isDisplayed: z
    .preprocess((val) => {
      if (val === "true") return true;
      if (val === "false") return false;
      return val;
    }, z.boolean())
    .optional(),
  subCategoryId: z.string().trim().min(2).max(50).optional(),
  category: z
    .preprocess((val) => {
      if (val === "true") return true;
      if (val === "false") return false;
      return val;
    }, z.boolean())
    .optional(),
});
export const deleteSubCategorySchema = z.object({
  subCategoryId: z.string().trim().min(2).max(50),
});
