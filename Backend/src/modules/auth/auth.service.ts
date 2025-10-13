import {
  generateAccessToken,
  generateRefreshToken,
} from "./../../utils/JwtToken";

// src/services/auth.service.ts
import { User } from "../user/user.model";
import jwt from "jsonwebtoken";
import argon2 from "argon2";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import { JWT_SECRET_KEY } from "../../config/envConfig";

export const loginService = async (email: string, password: string) => {
  // 1️⃣ Find user by email
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid email or password");
  }

  // 2️⃣ Check if active
  if (!user.isActive) {
    throw new ApiError(httpStatus.FORBIDDEN, "User account is deactivated");
  }

  // 3️⃣ Compare password using Argon2
  const isMatch = await argon2.verify(user.password, password);
  // 👆 Note: argon2.verify(storedHash, plainPassword)
  if (!isMatch) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid email or password");
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

  return { accessToken,refreshToken, user: userData };
};
