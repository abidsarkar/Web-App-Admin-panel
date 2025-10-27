import argon2 from "argon2";
import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import { ProductModel } from "./product.model";
import { generateAccessToken } from "../../utils/JwtToken";
import z from "zod";
import { createProductSchema } from "./product.zodSchema";
import { EmployerInfo } from "../auth/auth.model";
import { CategoryModel, SubCategoryModel } from "../category/category.model";

export const createProductService = async (
  data: z.infer<typeof createProductSchema>,
  admin_id: string,
  admin_role: string,
  admin_email: string
) => {
  // 🔒 Role-based access
  if (admin_role !== "editor" && admin_role !== "superAdmin") {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Access denied.");
  }

  // 🧩 Verify admin exists
  const existingUser = await EmployerInfo.findOne({ email: admin_email });
  if (!existingUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "Admin not found.");
  }

  if (admin_role === "editor" && existingUser.isActive === false) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Your account is deactivated.");
  }
  
  const { productSubCategoryId } = data;
  // ✅ Validate SubCategory
  const subCategory = await SubCategoryModel.findOne({
    subCategoryId: productSubCategoryId,
  });
  if (!subCategory) {
    throw new ApiError(httpStatus.NOT_FOUND, "Invalid subcategory ID");
  }
  const PutProductCategoryId = subCategory.categoryId;
  // 4️⃣ Generate JWT
  const accessToken = generateAccessToken({
    id: admin_id,
    role: admin_role,
    email: admin_email,
  });
  // ✅ Create the product
  const product = await ProductModel.create({
    ...data,
    productCategoryId: PutProductCategoryId,
    productSubCategoryId: subCategory.subCategoryId,
    createdBy: {
      id: admin_id,
      role: admin_role,
      email: admin_email,
      createdAt: new Date(),
    },
  });

  return {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Product created successfully",
    error: null,
    data: {
      accessToken,
      product,
      user: {
        id: admin_id,
        role: admin_role,
        email: admin_email,
      },
    },
  };
};
