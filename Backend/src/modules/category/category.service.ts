import ExcelJs from "exceljs";
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
import mongoose from "mongoose";

export const createCategoryService = async (
  data: z.infer<typeof createCategorySchema>,
  admin_id: string,
  admin_role: string,
  admin_email: string
) => {
  const { categoryId, categoryName } = data;
  // 1️⃣ Find user by email and check if employee already exists
  const existingUser =
    await EmployerInfo.findById(admin_id).select("-password");

  if (!existingUser) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Employee id is not found please use a valid id"
    );
  }

  if (existingUser.isActive == false) {
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
  const displayableFilter = { isDisplayed: true };
  
  // Define the subcategory fields you want to return
  const subCategoryFields = "subCategoryName subCategoryId categoryId categoryName isDisplayed createdAt updatedAt";
  
  // ✅ 1️⃣ If categoryId not provided → return all categories with subcategories
  if (!categoryId) {
    result = await CategoryModel.find(displayableFilter)
      .populate({
        path: "subCategories",
        select: subCategoryFields,
        match: { isDisplayed: true }
      })
      .select("-__v -createdBy -updatedBy -createdAt -updatedAt -isDisplayed")
      .sort({ categoryName: 1 }); // Optional: sort by category name
  }

  // ✅ 2️⃣ If categoryId provided
  else {
    const existingCategory = await CategoryModel.findOne({
      categoryId,
      ...displayableFilter,
    }).select("-__v -createdBy -updatedBy -createdAt -updatedAt -isDisplayed");

    if (!existingCategory) {
      throw new ApiError(httpStatus.NOT_FOUND, "Category not found");
    }

    // ✅ 3️⃣ If subCategory=true → populate with full subcategory details
    if (subCategory) {
      result = await CategoryModel.findOne({ 
        categoryId,
        ...displayableFilter 
      })
        .populate({
          path: "subCategories",
          select: subCategoryFields,
          match: { isDisplayed: true },
          options: { sort: { subCategoryName: 1 } } // Optional: sort subcategories
        })
        .select("-__v -createdBy -updatedBy -createdAt -updatedAt -isDisplayed");
    } else {
      // ✅ 4️⃣ Return category only (subCategories will be array of ObjectIds)
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
  const { categoryId, subCategory, isDisplayed } = data;

  let result;
  let query: any = {};

  // ➡️ Build dynamic filter based on provided fields
  if (isDisplayed !== undefined) {
    query.isDisplayed = isDisplayed;
  }

  // ➡️ Get the total count of categories (with filter if applied)
  const totalCategoryCount = await CategoryModel.countDocuments(query);

  // Define the subcategory fields you want to return for admin
  const subCategoryFields = "subCategoryName subCategoryId categoryId categoryName isDisplayed createdAt updatedAt createdBy updatedBy";

  // ✅ 1️⃣ If categoryId not provided → return all categories (with optional filters)
  if (!categoryId) {
    if (subCategory) {
      // Return all categories WITH subcategories
      result = await CategoryModel.find(query)
        .populate({
          path: "subCategories",
          select: subCategoryFields,
          // Admin can see all subcategories, not just displayable ones
          match: isDisplayed !== undefined ? { isDisplayed } : {} // Apply filter if provided
        })
        .select("-__v")
        .sort({ categoryName: 1 });
    } else {
      // Return all categories WITHOUT subcategories
      result = await CategoryModel.find(query)
        .select("-__v -subCategories")
        .sort({ categoryName: 1 });
    }
  }

  // ✅ 2️⃣ If categoryId provided
  else {
    // Add categoryId to the query and keep other filters
    query.categoryId = categoryId;

    if (subCategory) {
      // Return specific category WITH subcategories
      result = await CategoryModel.findOne(query)
        .populate({
          path: "subCategories",
          select: subCategoryFields,
          match: isDisplayed !== undefined ? { isDisplayed } : {} // Apply filter if provided
        })
        .select("-__v");
    } else {
      // Return specific category WITHOUT subcategories
      result = await CategoryModel.findOne(query)
        .select("-__v -subCategories");
    }

    if (!result) {
      throw new ApiError(httpStatus.NOT_FOUND, "Category not found");
    }
  }

  return {
    statusCode: httpStatus.OK,
    success: true,
    message: "Category fetched for admin successfully",
    error: null,
    data: {
      totalCategoryCount,
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
  // ✅ Extract fields from request body
  const { _id, isDisplayed, newCategoryId, newCategoryName } = data;

  // 🧩 2️⃣ Check if admin exists and is active
  const existingUser = await EmployerInfo.findById(admin_id).select("-password");
  if (!existingUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "Employee ID not found");
  }

  if (existingUser.isActive === false) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Your account is deactivated");
  }
  
  // 🔍 1️⃣ Verify old categoryId exists
  const oldCategory = await CategoryModel.findById(_id);
  if (!oldCategory) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Old categoryId is invalid or not found"
    );
  }
  
  // Store old values for updating subcategories
  const oldCategoryId = oldCategory.categoryId;
  const oldCategoryName = oldCategory.categoryName;
  
  // 🔍 2️⃣ Ensure newCategoryId not already used (if provided)
  if (newCategoryId && newCategoryId !== oldCategory.categoryId) {
    const duplicate = await CategoryModel.findOne({
      categoryId: newCategoryId,
    });
    if (duplicate) {
      throw new ApiError(httpStatus.CONFLICT, "New categoryId already exists");
    }
  }
  
  // ⚙️ 3️⃣ Perform the category update
  if (newCategoryName) oldCategory.categoryName = newCategoryName;
  if (isDisplayed !== undefined) oldCategory.isDisplayed = isDisplayed;
  if (newCategoryId) oldCategory.categoryId = newCategoryId;
  
  oldCategory.updatedBy = {
    id: admin_id,
    role: admin_role,
    email: admin_email,
    updatedAt: new Date(),
  };

  await oldCategory.save();

  // 🔄 4️⃣ Update all related subcategories if categoryId or categoryName changed
  let updatedSubcategories = null;
  if (newCategoryId || newCategoryName) {
    const updateSubcategoryData: any = {};
    
    if (newCategoryId) {
      updateSubcategoryData.categoryId = newCategoryId;
    }
    if (newCategoryName) {
      updateSubcategoryData.categoryName = newCategoryName;
    }
    
    // Add updatedBy information for subcategories
    updateSubcategoryData.updatedBy = {
      id: admin_id,
      role: admin_role,
      email: admin_email,
      updatedAt: new Date(),
    };

    // Update all subcategories that belong to this category
    updatedSubcategories = await SubCategoryModel.updateMany(
      { categoryId: oldCategoryId }, // Find by old categoryId
      updateSubcategoryData
    );
  }

  // 🧹 5️⃣ Return safe response
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
    message: "Category updated successfully",
    error: null,
    data: {
      accessToken,
      category: safeCategory,
      subcategoriesUpdated: updatedSubcategories ? {
        matchedCount: updatedSubcategories.matchedCount,
        modifiedCount: updatedSubcategories.modifiedCount
      } : null,
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
  // 🧩 Verify admin exists
  const existingUser = await EmployerInfo.findOne({ email: admin_email });
  if (!existingUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "Admin not found.");
  }

  if (existingUser.isActive === false) {
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
//! next plane is to don't delete subcategory if category is deleted insted of that just move it to a reciale bin type category with displayed false
//create sub category
export const createSubCategoryService = async (
  data: z.infer<typeof createSubCategorySchema>,
  admin_id: string,
  admin_role: string,
  admin_email: string
) => {
  const { isDisplayed, subCategoryName, subCategoryId, categoryId } = data;

  // 🧩 1️⃣ Validate admin
  const existingUser =
    await EmployerInfo.findById(admin_id).select("-password");
  if (!existingUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "Employee not found");
  }
  if (existingUser.isActive === false) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Your account is deactivated");
  }

  // 🔍 2️⃣ Check parent category exists
  const existingCategory = await CategoryModel.findOne({ categoryId });
  if (!existingCategory) {
    throw new ApiError(httpStatus.NOT_FOUND, "Category ID does not exist");
  }
  const categoryName = existingCategory.categoryName;
  // 🔁 3️⃣ Check subCategoryId is unique
  const existingSub = await SubCategoryModel.findOne({ subCategoryId });
  if (existingSub) {
    throw new ApiError(httpStatus.CONFLICT, "SubCategory ID already exists");
  }

  // 🧱 4️⃣ Create subcategory
  const newSubCategory = new SubCategoryModel({
    ...data,
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
  // 🧩 Verify admin
  const existingUser = await EmployerInfo.findById(admin_id);
  if (!existingUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "Admin not found.");
  }
  if (existingUser.isActive === false) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Your account is deactivated.");
  }

  // 🧾 Extract data
  const {
    isDisplayed,
    _id,
    newSubCategoryId,
    newSubCategoryName,
    newCategoryId,
  } = data;

  // 🔍 Find existing subcategory
  const subCategory = await SubCategoryModel.findById(_id);
  if (!subCategory) {
    throw new ApiError(httpStatus.NOT_FOUND, "Sub-category not found.");
  }

  // ✅ 1️⃣ If subCategoryId is changing, check uniqueness
  if (newSubCategoryId && newSubCategoryId !== subCategory.subCategoryId) {
    const duplicate = await SubCategoryModel.findOne({
      subCategoryId: newSubCategoryId,
    });
    if (duplicate) {
      throw new ApiError(
        httpStatus.CONFLICT,
        "New subCategoryId already exists."
      );
    }
    subCategory.subCategoryId = newSubCategoryId;
  }

  // ✅ 2️⃣ Handle category change (update categoryId + categoryName)
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

    // 🆕 Update categoryId & categoryName
    subCategory.categoryId = newCategoryId;
    subCategory.categoryName = newCategory.categoryName;
  }

  // ✅ 3️⃣ Update subCategoryName if provided
  if (newSubCategoryName) {
    subCategory.subCategoryName = newSubCategoryName;
  }
  if (isDisplayed !== undefined) {
    subCategory.isDisplayed = isDisplayed;
  }

  // ✅ 4️⃣ Update metadata
  subCategory.updatedBy = {
    id: admin_id,
    role: admin_role,
    email: admin_email,
    updatedAt: new Date(),
  };

  await subCategory.save();

  // ✅ 5️⃣ Generate new token
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
  const displayableFilter = { isDisplayed: true };
  // ✅ 1️⃣ If no subCategoryId → return all subcategories
  if (!subCategoryId) {
    result = await SubCategoryModel.find(displayableFilter).select(
      "-__v -createdBy -updatedBy -createdAt -updatedAt"
    );
  }

  // ✅ 2️⃣ If subCategoryId provided → get that subcategory
  else {
    const existingSubCategory = await SubCategoryModel.findOne({
      subCategoryId,
      ...displayableFilter,
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
  const { subCategoryId, category, isDisplayed } = data;

  let result;
  let query: any = {};
  // ➡️ Build dynamic filter based on provided fields
  if (isDisplayed !== undefined) {
    query.isDisplayed = isDisplayed;
  }
  // ➡️ Get the total count of categories (with filter if applied)
  const totalSubCategoryCount = await SubCategoryModel.countDocuments(query);
  // ✅ 1️⃣ If subCategoryId not provided → return all categories
  if (!subCategoryId) {
    result = await SubCategoryModel.find(query).select("-__v");
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
      totalSubCategoryCount,
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
export const exportCategoriesAndSubcategoriesService = async (
  admin_id: string,
  admin_role: string,
  admin_email: string
) => {
  // Fetch categories and subcategories
  const categories = await CategoryModel.find().lean();
  const subcategories = await SubCategoryModel.find().lean();

  if (!categories.length && !subcategories.length) {
    throw new ApiError(httpStatus.NOT_FOUND, "No categories or subcategories found");
  }

  // Create workbook
  const workbook = new ExcelJs.Workbook();

  // ===== CATEGORIES WORKSHEET =====
  const categoriesWorksheet = workbook.addWorksheet("Categories");

  // Define columns for categories
  categoriesWorksheet.columns = [
    { header: "_id", key: "_id", width: 25 },
    { header: "Category ID", key: "categoryId", width: 20 },
    { header: "Category Name", key: "categoryName", width: 30 },
    { header: "Display Status", key: "isDisplayed", width: 15 },
    { header: "Sub Categories Count", key: "subCategoriesCount", width: 20 },
    { header: "Created By", key: "createdBy_email", width: 25 },
    { header: "Updated By", key: "updatedBy_email", width: 25 },
    { header: "Created Date", key: "createdAt", width: 20 },
    { header: "Updated Date", key: "updatedAt", width: 20 },
  ];

  // Add data rows for categories
  categories.forEach((category) => {
    categoriesWorksheet.addRow({
      _id: category._id?.toString() || "N/A",
      categoryId: category.categoryId || "N/A",
      categoryName: category.categoryName || "N/A",
      isDisplayed: category.isDisplayed ? "Yes" : "No",
      subCategoriesCount: category.subCategories?.length || 0,
      createdBy_email: category.createdBy?.email || "N/A",
      updatedBy_email: category.updatedBy?.email || "N/A",
      createdAt: category.createdAt
        ? new Date(category.createdAt).toLocaleString()
        : "N/A",
      updatedAt: category.updatedAt
        ? new Date(category.updatedAt).toLocaleString()
        : "N/A",
    });
  });

  // Style categories header row
  categoriesWorksheet.getRow(1).font = { bold: true };
  categoriesWorksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE6F3FF" }, // Light blue background
  };

  // Auto-fit categories columns
  categoriesWorksheet.columns.forEach(column => {
    if (column.width) {
      column.width = Math.max(column.width, 12);
    }
  });

  // ===== SUBCATEGORIES WORKSHEET =====
  const subcategoriesWorksheet = workbook.addWorksheet("SubCategories");

  // Define columns for subcategories
  subcategoriesWorksheet.columns = [
    { header: "_id", key: "_id", width: 25 },
    { header: "Sub Category ID", key: "subCategoryId", width: 20 },
    { header: "Sub Category Name", key: "subCategoryName", width: 30 },
    { header: "Category ID", key: "categoryId", width: 20 },
    { header: "Category Name", key: "categoryName", width: 30 },
    { header: "Display Status", key: "isDisplayed", width: 15 },
    { header: "Created By", key: "createdBy_email", width: 25 },
    { header: "Updated By", key: "updatedBy_email", width: 25 },
    
  ];

  // Add data rows for subcategories
  subcategories.forEach((subcategory) => {
    subcategoriesWorksheet.addRow({
      _id: subcategory._id?.toString() || "N/A",
      subCategoryId: subcategory.subCategoryId || "N/A",
      subCategoryName: subcategory.subCategoryName || "N/A",
      categoryId: subcategory.categoryId || "N/A",
      categoryName: subcategory.categoryName || "N/A",
      isDisplayed: subcategory.isDisplayed ? "Yes" : "No",
      createdBy_email: subcategory.createdBy?.email || "N/A",
      updatedBy_email: subcategory.updatedBy?.email || "N/A",
     
    });
  });

  // Style subcategories header row
  subcategoriesWorksheet.getRow(1).font = { bold: true };
  subcategoriesWorksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF0E6F3" }, // Light purple background
  };

  // Auto-fit subcategories columns
  subcategoriesWorksheet.columns.forEach(column => {
    if (column.width) {
      column.width = Math.max(column.width, 12);
    }
  });

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  const accessToken = generateAccessToken({
    id: admin_id,
    role: admin_role,
    email: admin_email,
  });

  return {
    statusCode: httpStatus.OK,
    success: true,
    message: "Categories and subcategories exported successfully",
    error: null,
    data: {
      accessToken,
      buffer: Buffer.from(buffer),
      fileName: `categories_export_${Date.now()}.xlsx`,
      counts: {
        categories: categories.length,
        subcategories: subcategories.length
      },
      user: {
        id: admin_id,
        role: admin_role,
        email: admin_email,
      },
    },
  };
};