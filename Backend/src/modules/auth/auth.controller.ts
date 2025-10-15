// src/controllers/auth.controller.ts
import { Request, Response } from "express";
import { loginService, forgotPasswordService } from "./auth.service";
import catchAsync from "../../utils/catchAsync";
import httpStatus from "http-status";
import { loginSchema, emailSchema } from "./auth.zodSchema";
import z from "zod";
import sendResponse from "../../utils/sendResponse";
import { sendCookie } from "./auth.utils";
export const loginController = catchAsync(
  async (req: Request, res: Response) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      const formattedErrors = parsed.error.format();
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "Validation Error",
        //errors: formattedErrors,
        errors: z.treeifyError(parsed.error),
        //errors2: z.prettifyError(parsed.error),
      });
    }
    const { email, password } = parsed.data;
    const { accessToken, refreshToken, user } = await loginService(
      email,
      password
    );

    //send refresh token in cookie
    sendCookie(res, refreshToken);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Login successful",
      data: {
        accessToken,
        user,
      },
    });
  }
);
export const forgotPasswordController = catchAsync(
  async (req: Request, res: Response) => {
    const { email } = req.body;
    const { forgotPasswordToken } = await forgotPasswordService(email);
    res.cookie("forgotPasswordToken", forgotPasswordToken,
      {
        httpOnly:true,
        secure:process.env.NODE_ENV==="production",
        sameSite:"strict",
        maxAge: 5 * 60 * 1000, // 5 minutes
      }
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Forgot password otp send to your email successful",
      data: {},
    });
  }
);
