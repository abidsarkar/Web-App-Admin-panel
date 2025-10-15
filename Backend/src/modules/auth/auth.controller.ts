// src/controllers/auth.controller.ts
import { Request, Response } from "express";
import { loginService } from "./auth.service";
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
export const forgotPassword = catchAsync(
  async (req: Request, res: Response) => {
    //check if email is valid using zod
    const parsed = emailSchema.safeParse(req.body.email);
    //return error if email is not valid formate
    if (!parsed.success) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "Invalid email formate",
        errors: z.treeifyError(parsed.error),
      });
    }
    const email = parsed.data;
    // check if the email is exist in database or not
  }
);
