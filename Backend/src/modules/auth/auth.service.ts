import z, { success } from "zod";
import {
  generateAccessToken,
  generateForgotPasswordToken,
  generateRefreshToken,
} from "./../../utils/JwtToken";

// src/services/auth.service.ts
import { Admin } from "../user/user.model";
import jwt from "jsonwebtoken";
import argon2 from "argon2";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import { JWT_SECRET_KEY } from "../../config/envConfig";
import { response } from "express";
import { emailSchema } from "./auth.zodSchema";
import { error } from "console";
import {
  generateOTP,
  otpExpireTime,
  sendForgotPasswordOTPEmail,
} from "./auth.utils";

export const loginService = async (email: string, password: string) => {
  // 1️⃣ Find user by email
  const user = await Admin.findOne({ email }).select("+password");
  if (!user) {
    throw new ApiError(httpStatus.FORBIDDEN, "User account is deactivated");
  }

  // 2️⃣ Check if active
  if (!user.isActive) {
    throw new ApiError(httpStatus.FORBIDDEN, "User account is deactivated --");
  }

  // 3️⃣ Compare password using Argon2
  const isMatch = await argon2.verify(user.password, password);
  // 👆 Note: argon2.verify(storedHash, plainPassword)
  if (!isMatch) {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, "Password is incorrect");
  }

  // 4️⃣ Generate JWT
  const accessToken = generateAccessToken({
    id: user._id,
    role: user.role,
    email: user.email,
  });
  const refreshToken = generateRefreshToken({
    id: user._id,
    role: user.role,
    email: user.email,
  });
  // 5️⃣ Prepare response (omit password)
  const userData = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  return { accessToken, refreshToken, user: userData };
};
// forgot password service
export const forgotPasswordService = async (email: string) => {
  //check if email is valid using zod
  const parsed = emailSchema.safeParse(email);
  //return error if email is not valid formate
  if (!parsed.success) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Validation error", {
      path: "body",
      value: z.treeifyError(parsed.error),
    });
  }
  // 2 Find user by email
  const user = await Admin.findOne({ email }).select("+password");
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User Not found");
  }

  // 3 Check if active
  if (!user.isActive) {
    throw new ApiError(httpStatus.FORBIDDEN, "User account is deactivated");
  }
  // generate OTP
  const otp = generateOTP();
  const otpExpiresAt = await otpExpireTime(); // Get the OTP expiration time

  // 3. Update the OTP and expiration time in the user's document
  user.otp = otp;
  user.otpExpiresAt = otpExpiresAt;
  user.isForgotPasswordVerified = false; // Set the forgot password verification flag to true
  // 4. Send OTP email to the user
  await sendForgotPasswordOTPEmail(email, otp, user.name);
  // Save the user document with the new OTP and expiration time
  await user.save();
  const forgotPasswordToken = generateForgotPasswordToken({
    email: user.email,
  });
  return { forgotPasswordToken };
};
