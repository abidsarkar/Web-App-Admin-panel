import argon2 from "argon2";
import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import { SubCategoryModel, CategoryModel } from "./category.model";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../utils/JwtToken";
import z, { email } from "zod";
import {
  createCategorySchema,
  createSubCategorySchema,
  updateCategorySchema,
  updateSubCategorySchema,
} from "./category.zodSchema";
import { EmployerInfo } from "../auth/auth.model";

export const createCategoryService = async (
  data: z.infer<typeof createCategorySchema>,
  admin_id: string,
  admin_role: string,
  admin_email: string
) => {
  // 🔒 Role-based access control
  if (admin_role !== "editor" && admin_role !== "superAdmin") {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "You don't have access to create new employee"
    );
  }

  const { categoryId, categoryName } = data;
  // 1️⃣ Find user by email and check if employee already exists
  const existingUser = await EmployerInfo.findOne({
    email: admin_email,
  }).select("-password");

  if (!existingUser) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Employee id is not found please use a valid id"
    );
  }

  if (admin_role === "editor" && existingUser.isActive == false) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "Your id is Deactivated please contact superAdmin"
    );
  }
  const existing = await CategoryModel.findOne({ categoryId, categoryName });
  if (existing) {
    throw new ApiError(httpStatus.CONFLICT, "Category id already exists");
  }
  // 2️⃣ Create new Employer (Zod already validated the fields)
  const newCategory = new CategoryModel({
    ...data,
    createdBy: {
      id: admin_id,
      role: admin_role,
      email: admin_email,
    },
  });

  await newCategory.save();

  // Remove sensitive fields
  const { __v, ...safeUser } = newCategory.toObject();

  // 🔑 Generate Access Token for admin
  const accessToken = generateAccessToken({
    id: admin_id,
    role: admin_role,
    email: admin_email,
  });

  return {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "New category Created Successfully",
    error: null,
    data: {
      accessToken,
      category: safeUser,
      user: {
        id: admin_id,
        role: admin_role,
        email: admin_email,
      },
    },
  };
};
export const updateCategoryService = async (
  data: z.infer<typeof updateCategorySchema>,
  admin_id: string,
  admin_role: string,
  admin_email: string
) => {
  // 🔒 Role-based access control
  if (admin_role !== "editor" && admin_role !== "superAdmin") {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "You don't have access to update employee"
    );
  }
  // ✅ Extract fields from request body
  const { categoryId, newCategoryId, newCategoryName } = data;
  if (!newCategoryName && !newCategoryId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Please provide at least one field to update,"newCategoryId","newCategoryName"'
    );
  }
  // 🧩 2️⃣ Check if admin exists and is active
  const existingUser = await EmployerInfo.findOne({
    email: admin_email,
  }).select("-password");
  if (!existingUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "Employee ID not found");
  }

  if (admin_role === "editor" && existingUser.isActive === false) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Your account is deactivated");
  }
  // 🔍 1️⃣ Verify old categoryId exists
  const oldCategory = await CategoryModel.findOne({ categoryId });
  if (!oldCategory) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Old categoryId is invalid or not found"
    );
  }
  // 🔍 2️⃣ Ensure newCategoryId not already used (if provided)
  if (newCategoryId) {
    const duplicate = await CategoryModel.findOne({
      categoryId: newCategoryId,
    });
    if (duplicate) {
      throw new ApiError(httpStatus.CONFLICT, "New categoryId already exists");
    }
  }
  // ⚙️ 3️⃣ Perform the update
  if (newCategoryName) oldCategory.categoryName = newCategoryName;
  if (newCategoryId) oldCategory.categoryId = newCategoryId;
  oldCategory.updatedBy = {
    id: admin_id,
    role: admin_role,
    email: admin_email,
    updatedAt: new Date(),
  };

  await oldCategory.save();

  // 🧹 4️⃣ Return safe response
  const { __v, ...safeCategory } = oldCategory.toObject();

  // 🔑 Generate Access Token for admin
  const accessToken = generateAccessToken({
    id: admin_id,
    role: admin_role,
    email: admin_email,
  });

  return {
    statusCode: httpStatus.ACCEPTED,
    success: true,
    message: "category updated Successfully",
    error: null,
    data: {
      accessToken,
      category: safeCategory,
      user: {
        id: admin_id,
        role: admin_role,
        email: admin_email,
      },
    },
  };
};
//create sub category
export const createSubCategoryService = async (
  data: z.infer<typeof createSubCategorySchema>,
  admin_id: string,
  admin_role: string,
  admin_email: string
) => {
  // 🔒 Role-based access control
  if (admin_role !== "editor" && admin_role !== "superAdmin") {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "You don't have access to create a subcategory"
    );
  }

  const { subCategoryName, subCategoryId, categoryId } = data;

  // 🧩 1️⃣ Validate admin
  const existingUser = await EmployerInfo.findOne({
    email: admin_email,
  }).select("-password");
  if (!existingUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "Employee not found");
  }
  if (admin_role === "editor" && existingUser.isActive === false) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Your account is deactivated");
  }

  // 🔍 2️⃣ Check parent category exists
  const existingCategory = await CategoryModel.findOne({ categoryId });
  if (!existingCategory) {
    throw new ApiError(httpStatus.NOT_FOUND, "Category ID does not exist");
  }

  // 🔁 3️⃣ Check subCategoryId is unique
  const existingSub = await SubCategoryModel.findOne({ subCategoryId });
  if (existingSub) {
    throw new ApiError(httpStatus.CONFLICT, "SubCategory ID already exists");
  }

  // 🧱 4️⃣ Create subcategory
  const newSubCategory = new SubCategoryModel({
    subCategoryName,
    subCategoryId,
    categoryId,
    createdBy: {
      id: admin_id,
      role: admin_role,
      email: admin_email,
    },
  });
  await newSubCategory.save();

  // 🔗 5️⃣ Link to parent category
  if (!existingCategory.subCategories) {
    existingCategory.subCategories = [];
  }
  existingCategory.subCategories.push(newSubCategory._id);
  existingCategory.updatedBy = {
    id: admin_id,
    role: admin_role,
    email: admin_email,
    updatedAt: new Date(),
  };
  await existingCategory.save();

  // 🧹 6️⃣ Remove sensitive fields
  const { __v, ...safeSubCategory } = newSubCategory.toObject();

  // 🔑 Generate Access Token for admin
  const accessToken = generateAccessToken({
    id: admin_id,
    role: admin_role,
    email: admin_email,
  });

  return {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "New sub-category Created Successfully",
    error: null,
    data: {
      accessToken,
      subcategory: safeSubCategory,
      user: {
        id: admin_id,
        role: admin_role,
        email: admin_email,
      },
    },
  };
};
export const updateSubCategoryService = async (
  data: z.infer<typeof updateSubCategorySchema>,
  admin_id: string,
  admin_role: string,
  admin_email: string
) => {
  // 🔒 Role-based access control
  if (admin_role !== "editor" && admin_role !== "superAdmin") {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Access denied.");
  }

  // 🧩 Verify admin
  const existingUser = await EmployerInfo.findOne({ email: admin_email });
  if (!existingUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "Admin not found.");
  }
  if (admin_role === "editor" && existingUser.isActive === false) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Your account is deactivated.");
  }

  // 🧾 Extract data
  const { subCategoryId, newSubCategoryId, subCategoryName, newCategoryId } = data;

  // 🔍 Find existing subcategory
  const subCategory = await SubCategoryModel.findOne({ subCategoryId });
  if (!subCategory) {
    throw new ApiError(httpStatus.NOT_FOUND, "Sub-category not found.");
  }

  // ✅ 1️⃣ Check if newSubCategoryId already exists (if provided)
  if (newSubCategoryId) {
    const duplicate = await SubCategoryModel.findOne({ subCategoryId: newSubCategoryId });
    if (duplicate) {
      throw new ApiError(httpStatus.CONFLICT, "New subCategoryId already exists.");
    }
    subCategory.subCategoryId = newSubCategoryId; // assign new id
  }

  // ✅ 2️⃣ Handle category change (if provided)
  if (newCategoryId && newCategoryId !== subCategory.categoryId) {
    const oldCategory = await CategoryModel.findOne({ categoryId: subCategory.categoryId });
    const newCategory = await CategoryModel.findOne({ categoryId: newCategoryId });

    if (!newCategory) {
      throw new ApiError(httpStatus.NOT_FOUND, "New categoryId not found.");
    }

    // remove from old category
    if (oldCategory && oldCategory.subCategories) {
      oldCategory.subCategories = oldCategory.subCategories.filter(
        (id) => !id.equals(subCategory._id)
      );
      await oldCategory.save();
    }

    // add to new category
    if (!newCategory.subCategories) newCategory.subCategories = [];
    if (!newCategory.subCategories.includes(subCategory._id)) {
      newCategory.subCategories.push(subCategory._id);
      await newCategory.save();
    }

    // update subcategory categoryId
    subCategory.categoryId = newCategoryId;
  }

  // ✅ 3️⃣ Update name if provided
  if (subCategoryName) {
    subCategory.subCategoryName = subCategoryName;
  }

  // ✅ Update metadata
  subCategory.updatedBy = {
    id: admin_id,
    role: admin_role,
    email: admin_email,
    updatedAt: new Date(),
  };

  await subCategory.save();

  // ✅ Generate new token
  const accessToken = generateAccessToken({
    id: admin_id,
    role: admin_role,
    email: admin_email,
  });

  // 🧾 Response
  return {
    statusCode: httpStatus.OK,
    success: true,
    message: "Sub-category updated successfully",
    error: null,
    data: {
      accessToken,
      subCategory,
      user: {
        id: admin_id,
        role: admin_role,
        email: admin_email,
      },
    },
  };
};
