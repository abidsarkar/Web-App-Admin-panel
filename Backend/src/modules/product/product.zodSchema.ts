import { z } from "zod";

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
