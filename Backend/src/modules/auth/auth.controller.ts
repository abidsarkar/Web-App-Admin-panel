// src/controllers/auth.controller.ts
import { Request, Response } from "express";
import { loginService } from "./auth.service";
import catchAsync from "../../utils/catchAsync";
import httpStatus from "http-status";

export const loginController = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ success: false, message: "Email and password are required" });
  }

  const { accessToken, refreshToken, user } = await loginService(email, password);

  // You can send refresh token in HttpOnly cookie if you prefer:
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7*24 * 60 * 60 * 1000, // 7 day
  });

  res.status(httpStatus.OK).json({
    success: true,
    message: "Login successful",
    user,
    accessToken,
  });
});
