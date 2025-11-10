import  argon2  from 'argon2';
import httpStatus  from 'http-status';
import ApiError from "../../errors/ApiError";
import { Admin } from "./test.model";
import { generateAccessToken, generateRefreshToken } from '../../utils/JwtToken';
export const loginService = async (email: string, password: string) => {
  // 1️⃣ Find user by email
  const user = await Admin.findOne({ email }).select("+password");
  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "User Not ");
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
    isActive:user.isActive
  };
 
  await user.save();

  return {
    statusCode: httpStatus.ACCEPTED,
    success: true,
    message: "password change successfully from profile",
    error: null,
    data: {
      accessToken,
      user:userData,
    },
  };
};