import  fs  from 'fs';
import argon2 from "argon2";
import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import { ProductModel } from "./product.model";
import { generateAccessToken } from "../../utils/JwtToken";
import z from "zod";
import {
  createProductSchema,
  fileSchema,
  productIdSchema,
} from "./product.zodSchema";
import { EmployerInfo } from "../auth/auth.model";
import { CategoryModel, SubCategoryModel } from "../category/category.model";
import { Types } from "mongoose";
import path from 'path';

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
    productCoverImage: {
      filePathURL:
        "public/uploads/productCoverPicture/product-image-placeholder.jpg",
      fileOriginalName: "product-image-placeholder.jpg",
      mimetype: "jpg",
      size: 1000,
    },
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
export const uploadProductCoverPictureService = async (
  data: z.infer<typeof productIdSchema>,
  productCoverPictureData: z.infer<typeof fileSchema> | null,
  admin_id: string,
  admin_role: string,
  admin_email: string
) => {
  // 🔒 Role-based access
  if (
    admin_role !== "editor" &&
    admin_role !== "superAdmin" &&
    admin_role !== "subAdmin"
  ) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Access denied.");
  }

  const existingUser = await EmployerInfo.findOne({
    email: admin_email,
  }).select("-password");

  if (!existingUser) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Employee not registered");
  }

  if (existingUser.isActive == false) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "Access denied.! Account is deactivate"
    );
  }

  const { _id } = data;

  // Convert string to ObjectId
  const objectId = new Types.ObjectId(_id);

  // Check if the product exists and get current cover image
  const existingProduct = await ProductModel.findById(objectId);
  if (!existingProduct) {
    throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
  }

  //! Logic for delete old image if it's not the default one
  const DEFAULT_IMAGE_PATH = "public/uploads/productCoverPicture/product-image-placeholder.jpg";
  const DEFAULT_IMAGE_NAME = "product-image-placeholder.jpg";

  // Check if there's an existing cover image and it's not the default one
  if (existingProduct.productCoverImage?.filePathURL && 
      existingProduct.productCoverImage.filePathURL !== DEFAULT_IMAGE_PATH &&
      existingProduct.productCoverImage.fileOriginalName !== DEFAULT_IMAGE_NAME) {
    
    const oldImagePath = path.join(process.cwd(), existingProduct.productCoverImage.filePathURL);
    
    // Delete the old image file if it exists
    if (fs.existsSync(oldImagePath)) {
      try {
        fs.unlinkSync(oldImagePath);
       // console.log(`✅ Deleted old image: ${oldImagePath}`);
      } catch (error) {
        console.error(`❌ Failed to delete old image: ${oldImagePath}`, error);
        // Don't throw error here - continue with update even if delete fails
      }
    }
  }

  // ✅ Update the product with new cover image
  const updatedProduct = await ProductModel.findByIdAndUpdate(
    objectId,
    {
      $set: {
        productCoverImage: {
          filePathURL: `public/uploads/productCoverPicture/${productCoverPictureData?.filename}`,
          fileOriginalName: productCoverPictureData?.originalname,
          fileServerName: productCoverPictureData?.filename,
          size: productCoverPictureData?.size,
          mimetype: productCoverPictureData?.mimetype,
        },
        updatedBy: {
          id: admin_id,
          role: admin_role,
          email: admin_email,
          updatedAt: new Date(),
        },
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );

  // Remove sensitive fields
  const { __v, ...safeProduct } = updatedProduct!.toObject();

  // 🔑 Generate Access Token for admin
  const accessToken = generateAccessToken({
    id: admin_id,
    role: admin_role,
    email: admin_email,
  });

  return {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product cover picture updated successfully",
    error: null,
    data: {
      accessToken,
      product: safeProduct,
      user: {
        id: admin_id,
        role: admin_role,
        email: admin_email,
      },
    },
  };
};