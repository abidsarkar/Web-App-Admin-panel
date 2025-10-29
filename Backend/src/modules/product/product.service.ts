import fs from "fs";
import argon2 from "argon2";
import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import { ProductModel } from "./product.model";
import { generateAccessToken } from "../../utils/JwtToken";
import z from "zod";
import {
  createProductSchema,
  deleteProductImageSchema,
  deleteProductSchema,
  fileSchema,
  getAllProductsSchema,
  productIdSchema,
  replaceProductImageSchema,
  updateProductSchema,
  uploadManyProductPicSchema,
} from "./product.zodSchema";
import { EmployerInfo } from "../auth/auth.model";
import { CategoryModel, SubCategoryModel } from "../category/category.model";
import { Types } from "mongoose";
import path from "path";

export const createProductService = async (
  data: z.infer<typeof createProductSchema>,
  admin_id: string,
  admin_role: string,
  admin_email: string
) => {
  // 🔒 Role-based access
  const allowedRoles = ["superAdmin", "subAdmin"];

  if (!allowedRoles.includes(admin_role)) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Access denied.");
  }

  // 🧩 Verify admin exists
  const existingUser = await EmployerInfo.findOne({ email: admin_email });
  if (!existingUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "Admin not found.");
  }

  if (existingUser.isActive === false) {
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
  const PutProductCategoryName = subCategory.categoryName;
  const PutProductSubCategoryName = subCategory.subCategoryName;

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
    categoryName: PutProductCategoryName,
    productSubCategoryId: subCategory.subCategoryId,
    subCategoryName: PutProductSubCategoryName,
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
//read all product public
export const getAllProductsService = async (
  query: z.infer<typeof getAllProductsSchema>
) => {
  const { page, limit, sort, order, search } = query;

  const skip = (page - 1) * limit;
  const sortField = sort || "createdAt";
  const sortOrder = order === "asc" ? 1 : -1;
  // ✅ Filter only products with isDisplayable = true
  const filter: any = { isDisplayable: true };
  // 🔍 Add search by product name, category or subcategory
  if (search && search.trim() !== "") {
    const regex = new RegExp(search, "i"); // case-insensitive search
    filter.$or = [
      { productName: regex },
      { productCategoryId: regex },
      { productSubCategoryId: regex },
      { categoryName: regex }, // Search by category name
      { subCategoryName: regex }, // Search by subcategory name
    ];
  }
  // 🧩 Hide unnecessary fields using .select()
  const hiddenFields =
    "-productDescription -productDeliveryOption -productCoverImage.mimetype -productCoverImage.size -productImages -productPaymentOption -createdAt -updatedAt -__v -createdBy -updatedBy";

  // 🧠 Fetch paginated data
  const [products, total] = await Promise.all([
    ProductModel.find(filter)
      .select(hiddenFields)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit),
    ProductModel.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    statusCode: httpStatus.OK,
    success: true,
    message: "All Product List retrieved successfully",
    error: null,
    data: {
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      products,
    },
  };
};
//!read all product admin
export const getAllProductsAdminService = async (
  query: z.infer<typeof getAllProductsSchema>
) => {
  const { page, limit, sort, order } = query;

  const skip = (page - 1) * limit;
  const sortField = sort || "createdAt";
  const sortOrder = order === "asc" ? 1 : -1;
  // ✅ Filter only products with isDisplayable = true
  const filter = { isDisplayable: true };

  // 🧩 Hide unnecessary fields using .select()
  const hiddenFields =
    "-productDescription -productDeliveryOption -productCoverImage.mimetype -productCoverImage.size -productImages -productPaymentOption -createdAt -updatedAt -__v -createdBy -updatedBy";

  // 🧠 Fetch paginated data
  const [products, total] = await Promise.all([
    ProductModel.find(filter)
      .select(hiddenFields)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit),
    ProductModel.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    statusCode: httpStatus.OK,
    success: true,
    message: "All Product List retrieved successfully",
    error: null,
    data: {
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      products,
    },
  };
};
//read product admin
//update product
export const updateProductService = async (
  data: z.infer<typeof updateProductSchema>,
  admin_id: string,
  admin_role: string,
  admin_email: string
) => {
  // 🔒 Role-based access
  const allowedRoles = ["superAdmin", "subAdmin"];

  if (!allowedRoles.includes(admin_role)) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Access denied.");
  }

  // 🧩 Verify admin exists
  const existingUser = await EmployerInfo.findOne({ email: admin_email });
  if (!existingUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "Admin not found.");
  }

  if (existingUser.isActive === false) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Your account is deactivated.");
  }

  const { _id, productSubCategoryId } = data;
  // Convert string to ObjectId
  const objectId = new Types.ObjectId(_id);
  // ✅ Validate SubCategory
  let subCategory;
  if (productSubCategoryId) {
    subCategory = await SubCategoryModel.findOne({
      subCategoryId: productSubCategoryId,
    });
  }
  if (!subCategory) {
    throw new ApiError(httpStatus.NOT_FOUND, "Invalid subcategory ID");
  }
  const PutProductCategoryId = subCategory.categoryId;
  const PutProductCategoryName = subCategory.categoryName;
  const PutProductSubCategoryName = subCategory.subCategoryName;

  // ✅ Create the product
  const updatedProduct = await ProductModel.findByIdAndUpdate(
    objectId,
    {
      $set: {
        ...data,
        productCategoryId: PutProductCategoryId,
        categoryName: PutProductCategoryName,
        subCategoryName: PutProductSubCategoryName,
        updatedBy: {
          id: admin_id,
          role: admin_role,
          email: admin_email,
          updatedAt: new Date(),
        },
      },
    },
    { new: true, runValidators: true }
  );
  const { __v, ...safeProduct } = updatedProduct!.toObject();
  // 4️⃣ Generate JWT
  const accessToken = generateAccessToken({
    id: admin_id,
    role: admin_role,
    email: admin_email,
  });
  return {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product update successfully",
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
//delete product service
export const deleteProductService = async (
  data: z.infer<typeof deleteProductSchema>,
  admin_id: string,
  admin_role: string,
  admin_email: string
) => {
  // ✅ Role check
  if (
    admin_role !== "editor" &&
    admin_role !== "superAdmin" &&
    admin_role !== "subAdmin"
  ) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Access denied");
  }

  const { _id } = data;
  const product = await ProductModel.findById(_id);
  if (!product) throw new ApiError(httpStatus.NOT_FOUND, "Product not found");

  // ✅ Delete cover image if not default
  const DEFAULT_IMAGE_PATH =
    "public/uploads/productCoverPicture/product-image-placeholder.jpg";
  const DEFAULT_IMAGE_NAME = "product-image-placeholder.jpg";

  if (
    product.productCoverImage?.filePathURL &&
    product.productCoverImage.filePathURL !== DEFAULT_IMAGE_PATH &&
    product.productCoverImage.fileOriginalName !== DEFAULT_IMAGE_NAME
  ) {
    const coverPath = path.join(
      process.cwd(),
      product.productCoverImage.filePathURL
    );
    if (fs.existsSync(coverPath)) {
      try {
        fs.unlinkSync(coverPath);
      } catch (error) {
        console.error(`❌ Failed to delete cover image: ${coverPath}`, error);
      }
    }
  }

  // ✅ Delete all productImages physically
  if (product.productImages && product.productImages.length > 0) {
    for (const img of product.productImages) {
      if (img.filePathURL) {
        const imgPath = path.join(process.cwd(), img.filePathURL);
        if (fs.existsSync(imgPath)) {
          try {
            fs.unlinkSync(imgPath);
          } catch (error) {
            console.error(
              `❌ Failed to delete product image: ${imgPath}`,
              error
            );
          }
        }
      }
    }
  }

  // ✅ Delete product from DB
  await ProductModel.findByIdAndDelete(_id);

  // 🔑 Return with new token
  const accessToken = generateAccessToken({
    id: admin_id,
    role: admin_role,
    email: admin_email,
  });

  return {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product and all related images deleted successfully",
    error: null,
    data: {
      accessToken,
      deletedProductId: _id,
      user: { id: admin_id, role: admin_role, email: admin_email },
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
  const DEFAULT_IMAGE_PATH =
    "public/uploads/productCoverPicture/product-image-placeholder.jpg";
  const DEFAULT_IMAGE_NAME = "product-image-placeholder.jpg";

  // Check if there's an existing cover image and it's not the default one
  if (
    existingProduct.productCoverImage?.filePathURL &&
    existingProduct.productCoverImage.filePathURL !== DEFAULT_IMAGE_PATH &&
    existingProduct.productCoverImage.fileOriginalName !== DEFAULT_IMAGE_NAME
  ) {
    const oldImagePath = path.join(
      process.cwd(),
      existingProduct.productCoverImage.filePathURL
    );

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
//upload many image for one  product
export const uploadProductManyPicService = async (
  data: z.infer<typeof productIdSchema>,
  files: z.infer<typeof uploadManyProductPicSchema>,
  admin_id: string,
  admin_role: string,
  admin_email: string
) => {
  if (
    admin_role !== "editor" &&
    admin_role !== "superAdmin" &&
    admin_role !== "subAdmin"
  ) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Access denied.");
  }

  const existingUser = await EmployerInfo.findOne({ email: admin_email });
  if (!existingUser || existingUser.isActive === false) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid or inactive user");
  }

  const objectId = new Types.ObjectId(data._id);
  const existingProduct = await ProductModel.findById(objectId);
  if (!existingProduct) {
    throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
  }

  // Map new images
  const newImages = files.map((file) => ({
    filePathURL: `public/uploads/productImages/${file.filename}`,
    fileOriginalName: file.originalname,
    fileServerName: file.filename,
    size: file.size,
    mimetype: file.mimetype,
  }));

  // Push new images
  const updatedProduct = await ProductModel.findByIdAndUpdate(
    objectId,
    {
      $push: { productImages: { $each: newImages } },
      $set: {
        updatedBy: {
          id: admin_id,
          role: admin_role,
          email: admin_email,
          updatedAt: new Date(),
        },
      },
    },
    { new: true, runValidators: true }
  );

  const accessToken = generateAccessToken({
    id: admin_id,
    role: admin_role,
    email: admin_email,
  });

  return {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product images uploaded successfully",
    error: null,
    data: {
      accessToken,
      product: updatedProduct,
      user: {
        id: admin_id,
        role: admin_role,
        email: admin_email,
      },
    },
  };
};
//delete
export const deleteProductImageService = async (
  data: z.infer<typeof deleteProductImageSchema>,
  admin_id: string,
  admin_role: string,
  admin_email: string
) => {
  if (
    admin_role !== "editor" &&
    admin_role !== "superAdmin" &&
    admin_role !== "subAdmin"
  ) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Access denied");
  }
  // 🧩 Verify admin exists
  const existingUser = await EmployerInfo.findOne({ email: admin_email });
  if (!existingUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "Admin not found.");
  }

  if (admin_role === "editor" && existingUser.isActive === false) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Your account is deactivated.");
  }
  const { productId, imageId } = data;

  const product = await ProductModel.findById(productId);
  if (!product) throw new ApiError(httpStatus.NOT_FOUND, "Product not found");

  const image = product.productImages?.find(
    (img: any) => img._id.toString() === imageId
  );

  if (!image) throw new ApiError(httpStatus.NOT_FOUND, "Image not found");

  // Delete physical file
  const filePath = path.join(process.cwd(), image.filePathURL);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  // Remove image from array
  await ProductModel.findByIdAndUpdate(productId, {
    $pull: { productImages: { _id: imageId } },
    $set: {
      updatedBy: {
        id: admin_id,
        role: admin_role,
        email: admin_email,
        updatedAt: new Date(),
      },
    },
  });

  const updatedProduct = await ProductModel.findById(productId);

  const accessToken = generateAccessToken({
    id: admin_id,
    role: admin_role,
    email: admin_email,
  });

  return {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product image deleted successfully",
    error: null,
    data: {
      accessToken,
      product: updatedProduct,
    },
  };
};
export const replaceProductImageService = async (
  data: z.infer<typeof replaceProductImageSchema>,
  newFile: z.infer<typeof fileSchema>,
  admin_id: string,
  admin_role: string,
  admin_email: string
) => {
  if (
    admin_role !== "editor" &&
    admin_role !== "superAdmin" &&
    admin_role !== "subAdmin"
  ) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Access denied");
  }
  // 🧩 Verify admin exists
  const existingUser = await EmployerInfo.findOne({ email: admin_email });
  if (!existingUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "Admin not found.");
  }

  if (admin_role === "editor" && existingUser.isActive === false) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Your account is deactivated.");
  }
  const { productId, imageId } = data;

  const product = await ProductModel.findById(productId);
  if (!product) throw new ApiError(httpStatus.NOT_FOUND, "Product not found");

  const image = product.productImages?.find(
    (img: any) => img._id.toString() === imageId
  );

  if (!image) throw new ApiError(httpStatus.NOT_FOUND, "Image not found");

  // Delete old file
  const oldPath = path.join(process.cwd(), image.filePathURL);
  if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);

  // Replace image data
  image.filePathURL = `public/uploads/productImages/${newFile.filename}`;
  image.fileOriginalName = newFile.originalname;
  image.fileServerName = newFile.filename;
  image.size = newFile.size;
  image.mimetype = newFile.mimetype;

  product.updatedBy = {
    id: admin_id,
    role: admin_role,
    email: admin_email,
    updatedAt: new Date(),
  };

  await product.save();

  const accessToken = generateAccessToken({
    id: admin_id,
    role: admin_role,
    email: admin_email,
  });

  return {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product image replaced successfully",
    error: null,
    data: {
      accessToken,
      product,
    },
  };
};
