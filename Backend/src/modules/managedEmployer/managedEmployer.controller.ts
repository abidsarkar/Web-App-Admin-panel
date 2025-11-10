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
  getAllEmployerInfoSchema,
  getEmployerInfoSchema,
  updateEmployerSchema,
  uploadProfilePictureSchema,
} from "./managedEmployer.zodSchema";
import {
  createEmployerService,
  deleteEmployeeInformationService,
  exportAllEmployeesToExcelService,
  getAllEmployeeInformationService,
  getAllSupAdminEmployeeInformationService,
  getEmployeeInformationService,
  updateEmployeeInformationService,
  updateEmployeeProfilePicService,
} from "./managedEmployer.service";
import { profilePictureUpload } from "../../multer/multer.upload";

export const createEmployerController = catchAsync(
  async (req: Request, res: Response) => {
    const parsed = createEmployerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "create employ Validation Error",
        errors: z.treeifyError(parsed.error),
      });
    }
    const parsedFile = uploadProfilePictureSchema.safeParse(req.file);
    if (!parsedFile.success) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "upload employ profile picture Validation Error",
        errors: z.treeifyError(parsedFile.error),
      });
    }

    let { ...profilePictureData } = req.file;
    const admin_id = req.user?.id; //supper admin id form accessToken
    const admin_role = req.user?.role; //supper admin role form accessToken
    const admin_email = req.user?.email; //supper admin email form accessToken
    const { statusCode, success, message, error, data } =
      await createEmployerService(
        parsed.data,
        profilePictureData,
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
//get all employee with pagination
export const getAllEmployerInfoController = catchAsync(
  async (req: Request, res: Response) => {
    const parsed = getAllEmployerInfoSchema.safeParse(req.query);
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
      await getAllEmployeeInformationService(
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
        pagination:data?.pagination,
        employer: data?.employees,
        user: data?.user,
      },
    });
  }
);
export const getAllSupAdminEmployerInfoController = catchAsync(
  async (req: Request, res: Response) => {
    const parsed = getAllEmployerInfoSchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "get all super Admin information Validation Error",
        errors: z.treeifyError(parsed.error),
      });
    }
    //console.log(parsed.data.role,"admin id from access token")
    const admin_id = req.user?.id; //supper admin id form accessToken
    const admin_role = req.user?.role; //supper admin role form accessToken
    const admin_email = req.user?.email; //supper admin email form accessToken
    const { statusCode, success, message, error, data } =
      await getAllSupAdminEmployeeInformationService(
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
        pagination:data?.pagination,
        employer: data?.employees,
        user: data?.user,
      },
    });
  }
);
export const updateEmployerInfoController = catchAsync(
  async (req: Request, res: Response) => {
    const parsed = updateEmployerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "update employee information Validation Error",
        errors: z.treeifyError(parsed.error),
      });
    }
   
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
//update profile picture of employee
export const updateEmployerProfilePicController = catchAsync(
  async (req: Request, res: Response) => {
    const parsed = uploadProfilePictureSchema.safeParse(req.file);
    if (!parsed.success) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "update employee profile picture Validation Error",
        errors: z.treeifyError(parsed.error),
      });
    }
    const emailAndIdData = getEmployerInfoSchema.safeParse(req.body);//verify email and id
    if (!emailAndIdData.success) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "update employee picture {email,employee_id} Validation Error",
        errors: z.treeifyError(emailAndIdData.error),
      });
    }
    
   const {...parsedFile} = req.file;
    const admin_id = req.user?.id; //supper admin id form accessToken
    const admin_role = req.user?.role; //supper admin role form accessToken
    const admin_email = req.user?.email; //supper admin email form accessToken
    const { statusCode, success, message, error, data } =
      await updateEmployeeProfilePicService(
        emailAndIdData.data,
        parsedFile,
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
export const exportAllEmployeesController = catchAsync(
  async (req: Request, res: Response) => {
    const { statusCode, success, message, error, data } =
      await exportAllEmployeesToExcelService(
        req.user!.id,
        req.user!.role,
        req.user!.email
      );

    // If there's an error, send normal JSON response
    if (!success || error) {
      sendAccessCookie(res, data?.accessToken);
      return sendResponse(res, {
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

    // Ensure buffer is properly typed
    const fileBuffer = Buffer.isBuffer(data.buffer) ? data.buffer : Buffer.from(data.buffer);

    // Set headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${data.fileName}`);
    res.setHeader('Content-Length', fileBuffer.length);

    // Send access token in cookie
    sendAccessCookie(res, data.accessToken);

    // Send the file buffer - this ends the response
    res.send(fileBuffer);
  }
);