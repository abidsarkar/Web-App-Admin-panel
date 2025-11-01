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
} from "./customerAuth.zodSchema";
import z from "zod";
import sendResponse from "../../utils/sendResponse";
import {
  sendAccessCookie,
  sendRefreshCookie,
  sendForgotPasswordCookie,
} from "./customerAuth.utils";
import ApiError from "../../errors/ApiError";
export const loginController = catchAsync(
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
//register new customer
export const registerController = catchAsync(
  async (req: Request, res: Response) => {
    const parsed = registerNewCustomerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "register Validation Error",
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

export const forgotPasswordController = catchAsync(
  async (req: Request, res: Response) => {
    const { email } = req.body;
    const { forgotPasswordToken } = await forgotPasswordService(email);
    sendForgotPasswordCookie(res, forgotPasswordToken);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Forgot password otp send to your email successful",
      data: {
        forgotPasswordToken: forgotPasswordToken,
      },
    });
  }
);
export const verifyForgotPasswordOTPController = catchAsync(
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
    const { otp, email } = parsed.data;
    const { statusCode, success, message, error, user } =
      await verifyForgotPasswordOTPService(otp, email);
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
export const changePasswordController = catchAsync(
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
    const { email, password } = parsed.data;
    const { statusCode, success, message, error, data } =
      await PasswordChangeService(password, email);
    sendResponse(res, {
      statusCode,
      success,
      message,
      error,
      data: {},
    });
  }
);
export const resendOTPController = catchAsync(
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
    const { email } = parsed.data;
    const { statusCode, success, message, error, data } =
      await resendOTPService(email);
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

export const changePassword_fromProfileController = catchAsync(
  async (req: Request, res: Response) => {
    const parsed = changePasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "change password Error",
        errors: z.treeifyError(parsed.error),
        data: {},
      });
    }
    const { email, password } = parsed.data;
    const { statusCode, success, message, error, data } =
      await changePassword_FromProfileService(password, email);
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
