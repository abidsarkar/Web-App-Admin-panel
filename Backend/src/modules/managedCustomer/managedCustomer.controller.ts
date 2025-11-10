// src/controllers/auth.controller.ts
import { Request, Response } from "express";

import catchAsync from "../../utils/catchAsync";
import httpStatus from "http-status";

import z from "zod";
import sendResponse from "../../utils/sendResponse";
import {
  sendAccessCookie,
  sendRefreshCookie,
  sendForgotPasswordCookie,
} from "../auth/auth.utils";
import ApiError from "../../errors/ApiError";
import {
  deactivateProfileSchema,
  getAllCustomerInfoSchema,
  getProfileForAdminSchema,
  getProfileSchema,
  updateCustomerProfileSchema,
  uploadProfilePictureSchema,
} from "./managedCustomer.zodSchema";
import {
  deactivateCustomerProfileService,
  deleteCustomerProfileService,
  getAllCustomerInformationService,
  getProfileForAdminService,
  getProfileService,
  updateCustomerProfilePicService,
  updateCustomerProfileService,
} from "./managedCustomer.service";

export const getProfileManagedCustomerController = catchAsync(
  async (req: Request, res: Response) => {
    const parsed = getProfileSchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "get Profile Error",
        errors: z.treeifyError(parsed.error),
        data: {},
      });
    }
    const user_id = req.user?.id;
    const user_role = req.user?.role;
    const user_email = req.user?.email;
    const { statusCode, success, message, error, data } =
      await getProfileService(parsed.data, user_id!, user_role!, user_email!);
    sendResponse(res, {
      statusCode,
      success,
      message,
      error,
      data: {
        user: data?.user,
      },
    });
  }
);
//get customer for admin
export const getProfileManagedCustomerController_Admin = catchAsync(
  async (req: Request, res: Response) => {
    const parsed = getProfileForAdminSchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "get customer by admin Error",
        errors: z.treeifyError(parsed.error),
        data: {},
      });
    }
    const user_id = req.user?.id;
    const user_role = req.user?.role;
    const user_email = req.user?.email;
    const { statusCode, success, message, error, data } =
      await getProfileForAdminService(
        parsed.data,
        user_id!,
        user_role!,
        user_email!
      );
    sendResponse(res, {
      statusCode,
      success,
      message,
      error,
      data: {
        customer: data?.customer,
        user: data?.user,
      },
    });
  }
);
export const getAllCustomerInfoController = catchAsync(
  async (req: Request, res: Response) => {
    const parsed = getAllCustomerInfoSchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "get all employee information Validation Error",
        errors: z.treeifyError(parsed.error),
      });
    }
    //console.log(parsed.data.role,"admin id from access token")
    const admin_id = req.user?.id; //supper admin id form accessToken
    const admin_role = req.user?.role; //supper admin role form accessToken
    const admin_email = req.user?.email; //supper admin email form accessToken
    const { statusCode, success, message, error, data } =
      await getAllCustomerInformationService(
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
        pagination: data?.pagination,
        customer: data?.customer,
        user: data?.user,
      },
    });
  }
);

export const updateManagedCustomerController = catchAsync(
  async (req: Request, res: Response) => {
    const parsed = updateCustomerProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "update customer Error",
        errors: z.treeifyError(parsed.error),
        data: {},
      });
    }
    const customer_id = req.user?.id;

    const { statusCode, success, message, error, data } =
      await updateCustomerProfileService(parsed.data, customer_id!);
    sendAccessCookie(res, data?.accessToken!);
    sendResponse(res, {
      statusCode,
      success,
      message,
      error,
      data: {
        accessToken: data?.accessToken,
        user: data?.user,
      },
    });
  }
);
export const updateCustomerProfilePicController = catchAsync(
  async (req: Request, res: Response) => {
    const parsed = uploadProfilePictureSchema.safeParse(req.file);
    if (!parsed.success) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "update employee profile picture Validation Error",
        errors: z.treeifyError(parsed.error),
      });
    }
    const customer_id = req.user?.id;

    const { ...parsedFile } = req.file;

    const { statusCode, success, message, error, data } =
      await updateCustomerProfilePicService(parsedFile, customer_id!);
    sendAccessCookie(res, data?.accessToken);
    sendResponse(res, {
      statusCode,
      success,
      message,
      error,
      data: {
        accessToken: data?.accessToken,
        customer: data?.customer,
      },
    });
  }
);
export const deleteCustomerProfileController = catchAsync(
  async (req: Request, res: Response) => {
    const parsed = getProfileSchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "delete customer account Validation Error",
        errors: z.treeifyError(parsed.error),
      });
    }
    const customer_id = req.user?.id;
    const { statusCode, success, message, error, data } =
      await deleteCustomerProfileService(parsed.data, customer_id!);
    sendResponse(res, {
      statusCode,
      success,
      message,
      error,
      data: {
        customer: data?.customer,
      },
    });
  }
);
//deactivate a customer account

export const deactivateCustomerProfileController_Admin = catchAsync(
  async (req: Request, res: Response) => {
    const parsed = deactivateProfileSchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "delete customer account Validation Error",
        errors: z.treeifyError(parsed.error),
      });
    }
    const admin_id = req.user?.id;
    const admin_role = req.user?.role;
    const admin_email = req.user?.email;
    const { statusCode, success, message, error, data } =
      await deactivateCustomerProfileService(
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
        customer: data?.customer,
        newStatus: data?.newStatus,
        user: data?.user,
      },
    });
  }
);
