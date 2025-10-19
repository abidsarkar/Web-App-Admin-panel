import httpStatus from "http-status";
import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import ApiError from "../../errors/ApiError";

import { sendAccessCookie, sendRefreshCookie } from "../auth/auth.utils";
import z from "zod";
import {
  createEmployerSchema,
  deleteEmployerInfoSchema,
  getEmployerInfoSchema,
} from "./managedEmployer.zodSchema";
import {
  createEmployerService,
  deleteEmployeeInformationService,
  getEmployeeInformationService,
  updateEmployeeInformationService,
} from "./managedEmployer.service";

export const createEmployerController = catchAsync(
  async (req: Request, res: Response) => {
    //console.log(req.body)
    const parsed = createEmployerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "create employ Validation Error",
        errors: z.treeifyError(parsed.error),
      });
    }
    
    //console.log(parsed.data.role,"admin id from access token")
    const admin_id = req.user?.id; //supper admin id form accessToken
    const admin_role = req.user?.role; //supper admin role form accessToken
    const admin_email = req.user?.email; //supper admin email form accessToken
    const { statusCode, success, message, error, data } =
      await createEmployerService(
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
        employer: data?.employer,
        user: data?.user,
      },
    });
  }
);

export const getEmployerInfoController = catchAsync(
  async (req: Request, res: Response) => {
    const parsed = getEmployerInfoSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "get employee information Validation Error",
        errors: z.treeifyError(parsed.error),
      });
    }
    //console.log(parsed.data.role,"admin id from access token")
    const admin_id = req.user?.id; //supper admin id form accessToken
    const admin_role = req.user?.role; //supper admin role form accessToken
    const admin_email = req.user?.email; //supper admin email form accessToken
    const { statusCode, success, message, error, data } =
      await getEmployeeInformationService(
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
        employer: data?.employee,
        user: data?.user,
      },
    });
  }
);
export const updateEmployerInfoController = catchAsync(
  async (req: Request, res: Response) => {
    const parsed = createEmployerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "update employee information Validation Error",
        errors: z.treeifyError(parsed.error),
      });
    }
    //console.log(parsed.data.role,"admin id from access token")
    const admin_id = req.user?.id; //supper admin id form accessToken
    const admin_role = req.user?.role; //supper admin role form accessToken
    const admin_email = req.user?.email; //supper admin email form accessToken
    const { statusCode, success, message, error, data } =
      await updateEmployeeInformationService(
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
        employer: data?.employee,
        user: data?.user,
      },
    });
  }
);
export const deleteEmployerInfoController = catchAsync(
  async (req: Request, res: Response) => {
    const parsed = deleteEmployerInfoSchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "delete employee information Validation Error",
        errors: z.treeifyError(parsed.error),
      });
    }
    const admin_id = req.user?.id; //supper admin id form accessToken
    const admin_role = req.user?.role; //supper admin role form accessToken
    const admin_email = req.user?.email; //supper admin email form accessToken
    const { statusCode, success, message, error, data } =
      await deleteEmployeeInformationService(
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
        user: data?.user,
      },
    });
  }
);
