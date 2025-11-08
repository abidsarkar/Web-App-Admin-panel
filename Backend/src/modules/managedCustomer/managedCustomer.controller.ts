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
  getProfileForAdminSchema,
  getProfileSchema,
  updateCustomerProfileSchema,
} from "./managedCustomer.zodSchema";
import {
  getProfileForAdminService,
  getProfileService,
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
//!get all customer for admin with filters
//!get all customer for admin with filters
export const updateProfileManagedCustomerController = catchAsync(
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
