import { z } from "zod";
import { MAX_PRODUCT_COVER_PIC_SIZE } from "../../config/envConfig";
import { Types } from "mongoose";

export const createProductSchema = z.object({
  productId: z.string().trim().min(2).max(50),
  productName: z.string().min(1, "Product name is required"),
  productDescription: z.string().optional(),
  productSize: z.string().optional(),
  productColor: z.string().optional(),
  productColorCode: z.string().optional(),
  // Price and stock
  productPrice: z.number().nonnegative("Price cannot be negative").optional(),
  productStock: z.number().nonnegative("Stock cannot be negative").optional(),
  productCategoryId: z.string().trim().optional(),
  productSubCategoryId: z.string().trim(),
  productDeliveryOption: z.string().optional(),
  productPaymentOption: z.string().optional(),
  isSaleable: z
    .preprocess((val) => {
      if (val === "true") return true;
      if (val === "false") return false;
      return val;
    }, z.boolean())
    .optional(),
  isDisplayable: z
    .preprocess((val) => {
      if (val === "true") return true;
      if (val === "false") return false;
      return val;
    }, z.boolean())
    .optional(),
});
export const productIdSchema = z.object({
  _id: z
    .string({
      message: "Product ID must be a string",
    })
    .refine((val) => Types.ObjectId.isValid(val), {
      message: "Invalid ObjectId format",
    }),
});
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/jpg",
];

export const uploadProductCoverPictureSchema = z.object({
  productCoverImage: z
    .file()
    .optional() // Make the file optional
    .refine(
      (file) => !file || file.size <= MAX_PRODUCT_COVER_PIC_SIZE,
      `File size must be less than ${MAX_PRODUCT_COVER_PIC_SIZE / (1024 * 1024)}MB`
    )
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
      `File must be one of ${ACCEPTED_IMAGE_TYPES.join(", ")}`
    ),
});
export const fileSchema = z.object({
  fieldname: z.string(),
  originalname: z.string(),
  encoding: z.string(),
  mimetype: z.string(),
  destination: z.any().optional(),
  filename: z.string(),
  path: z.string().optional(),
  buffer: z.any().optional(), // or path if you save files
  size: z.number(),
});
