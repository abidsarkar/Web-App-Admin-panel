import httpStatus from "http-status";
import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import ApiError from "../../errors/ApiError";

import { sendAccessCookie } from "../auth/auth.utils";
import z from "zod";
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
import {
  createCategoryService,
  createSubCategoryService,
  deleteCategoryService,
  deleteSubCategoryService,
  getCategoryForAdminService,
  getCategoryService,
  getSubCategoryForAdminService,
  getSubCategoryService,
  updateCategoryService,
  updateSubCategoryService,
} from "./category.service";

export const createCategoryController = catchAsync(
  async (req: Request, res: Response) => {
    const parsed = createCategorySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "create category Validation Error",
        errors: z.treeifyError(parsed.error),
      });
    }

    const admin_id = req.user?.id; //supper admin id form accessToken
    const admin_role = req.user?.role; //supper admin role form accessToken
    const admin_email = req.user?.email; //supper admin email form accessToken
    const { statusCode, success, message, error, data } =
      await createCategoryService(
        parsed.data,
        admin_id!,
        admin_role!,
        admin_email!
      );
    sendAccessCookie(res, data?.accessToken);
    sendResponse(res, {
      statusCode,
      success,
      message,
      error,
      data: {
        accessToken: data?.accessToken,
        category: data?.category,
        user: data?.user,
      },
    });
  }
);
//get category with conditional sub category
export const getCategoryController = catchAsync(
  async (req: Request, res: Response) => {
    const parsed = getCategorySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "get category Validation Error",
        errors: z.treeifyError(parsed.error),
      });
    }

    const admin_id = req.user?.id; //supper admin id form accessToken
    const admin_role = req.user?.role; //supper admin role form accessToken
    const admin_email = req.user?.email; //supper admin email form accessToken
    const { statusCode, success, message, error, data } =
      await getCategoryService(parsed.data);
    sendResponse(res, {
      statusCode,
      success,
      message,
      error,
      data: {
        category: data?.category,
      },
    });
  }
);
export const getCategoryForAdminController = catchAsync(
  async (req: Request, res: Response) => {
    const parsed = getCategorySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "get category for admin Validation Error",
        errors: z.treeifyError(parsed.error),
      });
    }

    const admin_id = req.user?.id; //supper admin id form accessToken
    const admin_role = req.user?.role; //supper admin role form accessToken
    const admin_email = req.user?.email; //supper admin email form accessToken
    const { statusCode, success, message, error, data } =
      await getCategoryForAdminService(
        parsed.data,
        admin_id!,
        admin_role!,
        admin_email!
      );
    sendResponse(res, {
      statusCode,
      success,
      message,
      error,
      data: {
        totalCategory: data?.totalCategoryCount,
        category: data?.category,
        user: data?.user,
      },
    });
  }
);
export const updateCategoryController = catchAsync(
  async (req: Request, res: Response) => {
    const parsed = updateCategorySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "update category Validation Error",
        errors: z.treeifyError(parsed.error),
      });
    }
    const admin_id = req.user?.id; //supper admin id form accessToken
    const admin_role = req.user?.role; //supper admin role form accessToken
    const admin_email = req.user?.email; //supper admin email form accessToken
    const { statusCode, success, message, error, data } =
      await updateCategoryService(
        parsed.data,
        admin_id!,
        admin_role!,
        admin_email!
      );
    sendAccessCookie(res, data?.accessToken);
    sendResponse(res, {
      statusCode,
      success,
      message,
      error,
      data: {
        accessToken: data?.accessToken,
        category: data?.category,
        user: data?.user,
      },
    });
  }
);
export const deleteCategoryController = catchAsync(
  async (req: Request, res: Response) => {
    const parsed = deleteCategorySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "delete category Validation Error",
        errors: z.treeifyError(parsed.error),
      });
    }
    const admin_id = req.user?.id; //supper admin id form accessToken
    const admin_role = req.user?.role; //supper admin role form accessToken
    const admin_email = req.user?.email; //supper admin email form accessToken
    const { statusCode, success, message, error, data } =
      await deleteCategoryService(
        parsed.data,
        admin_id!,
        admin_role!,
        admin_email!
      );
    sendAccessCookie(res, data?.accessToken);
    sendResponse(res, {
      statusCode,
      success,
      message,
      error,
      data: {
        accessToken: data?.accessToken,
        deletedCategoryId: data?.deletedCategoryId,
        user: data?.user,
      },
    });
  }
); //! next plan is don't delete subcategory just move it to a recycle bin type category
//create sub category
export const createSubCategoryController = catchAsync(
  async (req: Request, res: Response) => {
    const parsed = createSubCategorySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "create sub category Validation Error",
        errors: z.treeifyError(parsed.error),
      });
    }

    const admin_id = req.user?.id; //supper admin id form accessToken
    const admin_role = req.user?.role; //supper admin role form accessToken
    const admin_email = req.user?.email; //supper admin email form accessToken
    const { statusCode, success, message, error, data } =
      await createSubCategoryService(
        parsed.data,
        admin_id!,
        admin_role!,
        admin_email!
      );
    sendAccessCookie(res, data?.accessToken);
    sendResponse(res, {
      statusCode,
      success,
      message,
      error,
      data: {
        accessToken: data?.accessToken,
        subcategory: data?.subcategory,
        user: data?.user,
      },
    });
  }
);
export const updateSubCategoryController = catchAsync(
  async (req: Request, res: Response) => {
    const parsed = updateSubCategorySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "Update Sub Category Validation Error",
        errors: z.treeifyError(parsed.error),
      });
    }

    const admin_id = req.user?.id!;
    const admin_role = req.user?.role!;
    const admin_email = req.user?.email!;

    const { statusCode, success, message, error, data } =
      await updateSubCategoryService(
        parsed.data,
        admin_id,
        admin_role,
        admin_email
      );

    sendResponse(res, {
      statusCode,
      success,
      message,
      error,
      data,
    });
  }
);
export const getSubCategoryController = catchAsync(
  async (req: Request, res: Response) => {
    const parsed = getSubCategorySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "get sub category Validation Error",
        errors: z.treeifyError(parsed.error),
      });
    }

    const admin_id = req.user?.id; //supper admin id form accessToken
    const admin_role = req.user?.role; //supper admin role form accessToken
    const admin_email = req.user?.email; //supper admin email form accessToken
    const { statusCode, success, message, error, data } =
      await getSubCategoryService(parsed.data);
    sendResponse(res, {
      statusCode,
      success,
      message,
      error,
      data: {
        subCategory: data?.result,
      },
    });
  }
);
export const getSubCategoryForAdminController = catchAsync(
  async (req: Request, res: Response) => {
    const parsed = getSubCategorySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "get sub category for admin Validation Error",
        errors: z.treeifyError(parsed.error),
      });
    }

    const admin_id = req.user?.id; //supper admin id form accessToken
    const admin_role = req.user?.role; //supper admin role form accessToken
    const admin_email = req.user?.email; //supper admin email form accessToken
    const { statusCode, success, message, error, data } =
      await getSubCategoryForAdminService(
        parsed.data,
        admin_id!,
        admin_role!,
        admin_email!
      );
    sendResponse(res, {
      statusCode,
      success,
      message,
      error,
      data: {
        totalSubCategory: data?.totalSubCategoryCount,
        subCategory: data?.result,
      },
    });
  }
);
export const deleteSubCategoryController = catchAsync(
  async (req: Request, res: Response) => {
    const parsed = deleteSubCategorySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "delete sub category Validation Error",
        errors: z.treeifyError(parsed.error),
      });
    }
    const admin_id = req.user?.id; //supper admin id form accessToken
    const admin_role = req.user?.role; //supper admin role form accessToken
    const admin_email = req.user?.email; //supper admin email form accessToken
    const { statusCode, success, message, error, data } =
      await deleteSubCategoryService(
        parsed.data,
        admin_id!,
        admin_role!,
        admin_email!
      );
    sendAccessCookie(res, data?.accessToken);
    sendResponse(res, {
      statusCode,
      success,
      message,
      error,
      data: {
        accessToken: data?.accessToken,
        deletedSubCategoryId: data?.deletedSubCategoryId,
        user: data?.user,
      },
    });
  }
);
