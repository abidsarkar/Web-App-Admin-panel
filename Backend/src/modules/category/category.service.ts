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
  deleteCategorySchema,
  deleteSubCategorySchema,
  getCategorySchema,
  getSubCategorySchema,
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
      "You don't have access to create new category"
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
//get all category name only and sub category also with filter
export const getCategoryService = async (
  data: z.infer<typeof getCategorySchema>
) => {
  const { categoryId, subCategory } = data;

  let result;

  // ✅ 1️⃣ If categoryId not provided → return all categories
  if (!categoryId) {
    result = await CategoryModel.find().select(
      "-__v -createdBy -updatedBy -createdAt -updatedAt"
    );
  }

  // ✅ 2️⃣ If categoryId provided
  else {
    const existingCategory = await CategoryModel.findOne({ categoryId }).select(
      "-__v -createdBy -updatedBy -createdAt -updatedAt"
    );

    if (!existingCategory) {
      throw new ApiError(httpStatus.NOT_FOUND, "Category not found");
    }

    // ✅ 3️⃣ If subCategory=true → populate subcategories
    if (subCategory) {
      result = await CategoryModel.findOne({ categoryId })
        .populate("subCategories", "subCategoryName subCategoryId")
        .select("-__v -createdBy -updatedBy -createdAt -updatedAt");
    } else {
      // ✅ 4️⃣ Otherwise, return category only
      result = existingCategory;
    }
  }

  return {
    statusCode: httpStatus.OK,
    success: true,
    message: "Category fetched successfully",
    error: null,
    data: {
      category: result,
    },
  };
};
//get all category information with created by for admin only
export const getCategoryForAdminService = async (
  data: z.infer<typeof getCategorySchema>,
  admin_id: string,
  admin_role: string,
  admin_email: string
) => {
  // 🔒 Role-based access control
  if (
    admin_role !== "editor" &&
    admin_role !== "superAdmin" &&
    admin_role !== "subAdmin"
  ) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "You don't have access to view full details of category"
    );
  }
  const { categoryId, subCategory } = data;

  let result;

  // ✅ 1️⃣ If categoryId not provided → return all categories
  if (!categoryId) {
    result = await CategoryModel.find().select("-__v");
  }

  // ✅ 2️⃣ If categoryId provided
  else {
    const existingCategory = await CategoryModel.findOne({ categoryId }).select(
      "-__v"
    );

    if (!existingCategory) {
      throw new ApiError(httpStatus.NOT_FOUND, "Category not found");
    }

    // ✅ 3️⃣ If subCategory=true → populate subcategories
    if (subCategory) {
      result = await CategoryModel.findOne({ categoryId })
        .populate("subCategories", "subCategoryName subCategoryId")
        .select("-__v ");
    } else {
      // ✅ 4️⃣ Otherwise, return category only
      result = existingCategory;
    }
  }

  return {
    statusCode: httpStatus.OK,
    success: true,
    message: "Category fetched for admin successfully",
    error: null,
    data: {
      category: result,
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
//delete category
export const deleteCategoryService = async (
  data: z.infer<typeof deleteCategorySchema>,
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

  // 🧩 Extract categoryId
  const { categoryId } = data;

  // 🔍 Check if category exists
  const category = await CategoryModel.findOne({ categoryId });
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, "Category not found.");
  }

  // ⚠️ Delete all subcategories under this category
  await SubCategoryModel.deleteMany({ categoryId: category.categoryId });

  // ⚙️ Delete category itself
  await CategoryModel.deleteOne({ categoryId });

  // 🎫 Generate new access token
  const accessToken = generateAccessToken({
    id: admin_id,
    role: admin_role,
    email: admin_email,
  });

  return {
    statusCode: httpStatus.OK,
    success: true,
    message: "Category and all related subcategories deleted successfully",
    error: null,
    data: {
      accessToken,
      deletedCategoryId: categoryId,
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
  const { subCategoryId, newSubCategoryId, subCategoryName, newCategoryId } =
    data;

  // 🔍 Find existing subcategory
  const subCategory = await SubCategoryModel.findOne({ subCategoryId });
  if (!subCategory) {
    throw new ApiError(httpStatus.NOT_FOUND, "Sub-category not found.");
  }

  // ✅ 1️⃣ Check if newSubCategoryId already exists (if provided)
  if (newSubCategoryId) {
    const duplicate = await SubCategoryModel.findOne({
      subCategoryId: newSubCategoryId,
    });
    if (duplicate) {
      throw new ApiError(
        httpStatus.CONFLICT,
        "New subCategoryId already exists."
      );
    }
    subCategory.subCategoryId = newSubCategoryId; // assign new id
  }

  // ✅ 2️⃣ Handle category change (if provided)
  if (newCategoryId && newCategoryId !== subCategory.categoryId) {
    const oldCategory = await CategoryModel.findOne({
      categoryId: subCategory.categoryId,
    });
    const newCategory = await CategoryModel.findOne({
      categoryId: newCategoryId,
    });

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
export const getSubCategoryService = async (
  data: z.infer<typeof getSubCategorySchema>
) => {
  const { subCategoryId, category } = data;

  let result;

  // ✅ 1️⃣ If no subCategoryId → return all subcategories
  if (!subCategoryId) {
    result = await SubCategoryModel.find().select(
      "-__v -createdBy -updatedBy -createdAt -updatedAt"
    );
  }

  // ✅ 2️⃣ If subCategoryId provided → get that subcategory
  else {
    const existingSubCategory = await SubCategoryModel.findOne({
      subCategoryId,
    }).select("-__v -createdBy -updatedBy -createdAt -updatedAt");

    if (!existingSubCategory) {
      throw new ApiError(httpStatus.NOT_FOUND, "Sub Category not found");
    }

    // ✅ 3️⃣ If category=true → also fetch category info for that subcategory
    if (category) {
      const parentCategory = await CategoryModel.findOne({
        categoryId: existingSubCategory.categoryId,
      }).select("-__v -createdBy -updatedBy -createdAt -updatedAt");

      result = {
        subCategory: existingSubCategory,
        category: parentCategory || null,
      };
    } else {
      // ✅ Only return subcategory info
      result = existingSubCategory;
    }
  }

  return {
    statusCode: httpStatus.OK,
    success: true,
    message: "Sub-category fetched successfully",
    error: null,
    data: {
      result,
    },
  };
};

//get all category information with created by for admin only
export const getSubCategoryForAdminService = async (
  data: z.infer<typeof getSubCategorySchema>,
  admin_id: string,
  admin_role: string,
  admin_email: string
) => {
  // 🔒 Role-based access control
  if (
    admin_role !== "editor" &&
    admin_role !== "superAdmin" &&
    admin_role !== "subAdmin"
  ) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "You don't have access to view full details of category"
    );
  }
  const { subCategoryId, category } = data;

  let result;

  // ✅ 1️⃣ If subCategoryId not provided → return all categories
  if (!subCategoryId) {
    result = await SubCategoryModel.find().select("-__v");
  }

  // ✅ 2️⃣ If categoryId provided
  else {
    const existingSubCategory = await SubCategoryModel.findOne({
      subCategoryId,
    });

    if (!existingSubCategory) {
      throw new ApiError(httpStatus.NOT_FOUND, "sub Category not found");
    }

    // ✅ 3️⃣ If subCategory=true → populate subcategories
    if (category) {
      const parentCategory = await CategoryModel.findOne({
        categoryId: existingSubCategory.categoryId,
      });
      result = {
        subCategory: existingSubCategory,
        category: parentCategory || null,
      };
    } else {
      // ✅ 4️⃣ Otherwise, return category only
      result = existingSubCategory;
    }
  }

  return {
    statusCode: httpStatus.OK,
    success: true,
    message: "Sub-category fetched for admin successfully",
    error: null,
    data: {
      result,
      user: {
        id: admin_id,
        role: admin_role,
        email: admin_email,
      },
    },
  };
};
export const deleteSubCategoryService = async (
  data: z.infer<typeof deleteSubCategorySchema>,
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

  const { subCategoryId } = data;

  // 🔍 Check if subcategory exists
  const subCategory = await SubCategoryModel.findOne({ subCategoryId });
  if (!subCategory) {
    throw new ApiError(httpStatus.NOT_FOUND, "Sub-category not found.");
  }

  // ✅ Remove subcategory reference from parent category
  await CategoryModel.updateOne(
    { categoryId: subCategory.categoryId },
    { $pull: { subCategories: subCategory._id } }
  );

  // 🗑️ Delete the subcategory itself
  await SubCategoryModel.deleteOne({ _id: subCategory._id });

  // 🎫 Generate new access token
  const accessToken = generateAccessToken({
    id: admin_id,
    role: admin_role,
    email: admin_email,
  });

  return {
    statusCode: httpStatus.OK,
    success: true,
    message: "Sub-category deleted successfully",
    error: null,
    data: {
      accessToken,
      deletedSubCategoryId: subCategoryId,
      user: {
        id: admin_id,
        role: admin_role,
        email: admin_email,
      },
    },
  };
};