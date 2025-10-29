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
  searchKeyword: z.string().optional(),
  extraComment: z.string().optional(),
});
export const updateProductSchema = z.object({
  _id: z.string().trim().min(2).max(100),
  productId: z.string().trim().min(2).max(50).optional(),
  productName: z.string().min(1, "Product name is required").optional(),
  productDescription: z.string().optional(),
  productSize: z.string().optional(),
  productColor: z.string().optional(),
  productColorCode: z.string().optional(),
  // Price and stock
  productPrice: z.number().nonnegative("Price cannot be negative").optional(),
  productStock: z
    .number()
    .nonnegative("Stock cannot be negative")
    .int()
    .optional(),
  productSubCategoryId: z.string().trim().optional(),
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
  searchKeyword: z.string().optional(),
  extraComment: z.string().optional(),
});
//get all product for admin
export const getAllProductsAdminSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)), // default page = 1
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10)), // default limit = 10
  search: z.string().optional(), // optional search query (e.g., by name or email)
  isSaleable: z.preprocess((val) => {
    if (val === "true") return true;
    if (val === "false") return false;
    return val;
  }, z.boolean().optional()), // optional filter
  isDisplayable: z.preprocess((val) => {
    if (val === "true") return true;
    if (val === "false") return false;
    return val;
  }, z.boolean().optional()), // optional filter
  subCategoryId: z.string().optional(), // e.g. "createdAt"
  categoryId: z.string().optional(), // e.g. "createdAt"
  sort: z.string().optional(), // e.g. "createdAt"
  order: z.enum(["asc", "desc"]).optional(), // default desc
});
//get all product for public
export const getAllProductsSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)), // default page = 1
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10)), // default limit = 10
  search: z.string().optional(), // optional search query (e.g., by name or email)
  sort: z.string().optional(), // e.g. "createdAt"
  order: z.enum(["asc", "desc"]).optional(), // default desc
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
//upload cover photo
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
//upload many picture
export const uploadManyProductPicSchema = z.array(fileSchema).nonempty({
  message: "At least one image is required",
});
//delete picture
export const deleteProductImageSchema = z.object({
  productId: z.string().refine((val) => Types.ObjectId.isValid(val), {
    message: "Invalid product ID",
  }),
  imageId: z.string().refine((val) => Types.ObjectId.isValid(val), {
    message: "Invalid image ID",
  }),
});
//replace
export const replaceProductImageSchema = z.object({
  productId: z.string().refine((val) => Types.ObjectId.isValid(val), {
    message: "Invalid product ID",
  }),
  imageId: z.string().refine((val) => Types.ObjectId.isValid(val), {
    message: "Invalid image ID",
  }),
});
//delete the entire product
export const deleteProductSchema = z.object({
  _id: z.string().refine((val) => Types.ObjectId.isValid(val), {
    message: "Invalid product ID",
  }),
});
