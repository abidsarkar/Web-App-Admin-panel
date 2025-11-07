// src/controllers/auth.controller.ts
import { Request, Response } from "express";
import {
  loginService,
  forgotPasswordService,
  verifyForgotPasswordOTPService,
  PasswordChangeService,
  resendOTPService,
  changePassword_FromProfileService,
  refreshTokenService,
  registerService,
} from "./customerAuth.service";
import catchAsync from "../../utils/catchAsync";
import httpStatus from "http-status";
import {
  loginSchema,
  emailSchema,
  otpSchema,
  changePasswordSchema,
  registerNewCustomerSchema,
  changePasswordFromProfileSchema,
} from "./customerAuth.zodSchema";
import z from "zod";
import sendResponse from "../../utils/sendResponse";
import {
  sendAccessCookie,
  sendRefreshCookie,
  sendForgotPasswordCookie,
} from "./customerAuth.utils";
import ApiError from "../../errors/ApiError";
export const loginCustomerController = catchAsync(
  async (req: Request, res: Response) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "login Validation Error",
        errors: z.treeifyError(parsed.error),
      });
    }
    const { statusCode, success, message, error, data } = await loginService(
      parsed.data
    );

    //send refresh token in cookie
    sendRefreshCookie(res, data?.refreshToken);
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
export const registerCustomerController = catchAsync(
  async (req: Request, res: Response) => {
    const parsed = registerNewCustomerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "register customer Validation Error",
        errors: z.treeifyError(parsed.error),
      });
    }

    const { statusCode, success, message, error, data } = await registerService(
      parsed.data
    );
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
export const forgotPasswordCustomerController = catchAsync(
  async (req: Request, res: Response) => {
    const parsed = emailSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "forgot password customer Validation Error",
        errors: z.treeifyError(parsed.error),
      });
    }

    const { statusCode, success, message, error, data } =
      await forgotPasswordService(parsed.data);
    sendForgotPasswordCookie(res, data?.forgotPasswordToken);

    sendResponse(res, {
      statusCode,
      success,
      message,
      error,
      data: {
        forgotPasswordToken: data?.forgotPasswordToken,
        user: data?.user,
      },
    });
  }
);
export const verifyForgotPasswordOTPCustomerController = catchAsync(
  async (req: Request, res: Response) => {
    const parsed = otpSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "OTP Error",
        errors: z.treeifyError(parsed.error),
        data: {},
      });
    }
    const { statusCode, success, message, error, user } =
      await verifyForgotPasswordOTPService(parsed.data);
    sendResponse(res, {
      statusCode,
      success,
      message,
      error,
      data: {
        user,
      },
    });
  }
);
export const changePasswordCustomerController = catchAsync(
  async (req: Request, res: Response) => {
    const parsed = changePasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "password Error",
        errors: z.treeifyError(parsed.error),
        data: {},
      });
    }
    
    const { statusCode, success, message, error, data } =
      await PasswordChangeService(parsed.data);
    sendResponse(res, {
      statusCode,
      success,
      message,
      error,
      data,
    });
  }
);
export const resendOTPCustomerController = catchAsync(
  async (req: Request, res: Response) => {
    const parsed = emailSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "Resend otp Error",
        errors: z.treeifyError(parsed.error),
        data: {},
      });
    }
  
    const { statusCode, success, message, error, data } =
      await resendOTPService(parsed.data);
    sendForgotPasswordCookie(res, data.forgotPasswordToken);
    sendResponse(res, {
      statusCode,
      success,
      message,
      error,
      data: {
        forgotPasswordToken: data.forgotPasswordToken,
        user: data.user,
      },
    });
  }
);

export const changePassword_fromProfileCustomerController = catchAsync(
  async (req: Request, res: Response) => {
    
    const parsed = changePasswordFromProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "change password Error",
        errors: z.treeifyError(parsed.error),
        data: {},
      });
    }
    const admin_id = req.user?.id; 
    const admin_role = req.user?.role; 
    const admin_email = req.user?.email; 
    const { statusCode, success, message, error, data } =
      await changePassword_FromProfileService(parsed.data,
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
//refresh token controller
export const refreshTokenController = catchAsync(
  async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    //console.log(refreshToken);
    if (!refreshToken) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "No refresh token provided");
    }
    const { statusCode, success, message, error, new_refresh_Token, data } =
      await refreshTokenService(refreshToken);
    sendAccessCookie(res, data?.accessToken);
    sendRefreshCookie(res, new_refresh_Token);
    sendResponse(res, {
      statusCode,
      success,
      message,
      error,
      data: data,
    });
  }
);
export const logoutController = catchAsync(
  async (req: Request, res: Response) => {
    res.clearCookie("refreshToken");
    res.clearCookie("accessToken");
    res.clearCookie("forgotPasswordToken");
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Logout successful",
      error: null,
      data: null,
    });
  }
);
