// src/controllers/auth.controller.ts
import { Request, Response } from "express";
import { loginService } from "./auth.service";
import catchAsync from "../../utils/catchAsync";
import httpStatus from "http-status";
import { loginSchema } from "./auth.zodSchema";
import { success } from "zod";
import { error } from "console";
import z from "zod";
export const loginController = catchAsync(
  async (req: Request, res: Response) => {
    const parsed = loginSchema.safeParse(req.body);
    
    if (!parsed.success) {
      const formattedErrors  = parsed.error.format();
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "Validation Error",
        //errors: formattedErrors,
        errors: z.treeifyError(parsed.error),
        errors2: z.prettifyError(parsed.error),
        
      });
    }

    const { email, password } = parsed.data;

    try {
      const { accessToken, refreshToken, user } = await loginService(
        email,
        password
      );

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return res.status(httpStatus.OK).json({
        success: true,
        message: "Login successful",
        user,
        accessToken,
      });
    } catch (error) {
      // Handle service-level errors (like invalid credentials)
      return res.status(httpStatus.UNAUTHORIZED).json({
        success: false,
        message: "Invalid email or password",
      });
    }
  }
);