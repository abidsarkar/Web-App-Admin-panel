import z from "zod";
import {
  generateAccessToken,
  generateForgotPasswordToken,
  generateRefreshToken,
  verifyToken,
} from "../../utils/JwtToken";

// src/services/auth.service.ts
import { customerInfoModel } from "./customerAuth.model";
import jwt, { JwtPayload } from "jsonwebtoken";
import argon2 from "argon2";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import { JWT_SECRET_KEY } from "../../config/envConfig";
import {
  emailSchema,
  loginSchema,
  otpSchema,
  registerNewCustomerSchema,
} from "./customerAuth.zodSchema";
import {
  generateOTP,
  otpExpireTime,
  sendForgotPasswordOTPEmail,
  sendResendOTPEmail,
} from "./customerAuth.utils";
import { hashPassword } from "../../utils/hashManager";
import { sendCreateAccountEmail } from "./customerAuth.utils";

export const loginService = async (data: z.infer<typeof loginSchema>) => {
  const { email, password } = data;
  // 1️⃣ Find user by email
  const user = await customerInfoModel.findOne({ email }).select("+password");
  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "invalid email or password");
  }

  // 2️⃣ Check if active
  if (!user.isActive) {
    throw new ApiError(httpStatus.FORBIDDEN, "User account is deactivated!");
  }

  // 3️⃣ Compare password using Argon2
  const isMatch = await argon2.verify(user.password, password);
  // 👆 Note: argon2.verify(storedHash, plainPassword)
  if (!isMatch) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "invalid email or password");
  }
  user.otp = undefined;
  user.otpExpiresAt = undefined;
  user.changePasswordExpiresAt = undefined;
  user.isForgotPasswordVerified = undefined;
  await user.save();
  const {
    password: _,
    __v,
    otp,
    otpExpiresAt,
    changePasswordExpiresAt,
    isForgotPasswordVerified,
    ...safeUser
  } = user.toObject();
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
  return {
    statusCode: httpStatus.OK,
    success: true,
    message: "Login successfully",
    error: null,
    data: {
      accessToken,
      refreshToken,
      user: safeUser,
    },
  };
};
//register new customer service
export const registerService = async (
  data: z.infer<typeof registerNewCustomerSchema>
) => {
  const { email, password } = data;
  // 1️⃣ Find user by email
  const existUser = await customerInfoModel
    .findOne({ email })
    .select("-password");
  if (existUser) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "User already register");
  }
  const hashedPassword = await hashPassword(password);
  const newCustomer = new customerInfoModel({
    ...data,
    password: hashedPassword,
    profilePicture: {
      filePathURL: `public/uploads/profile_pictures/defaultProfilePictureAADD.png`,
      fileOriginalName: "defaultProfilePictureAADD.png",
      fileServerName: "defaultProfilePictureAADD.png",
      size: 1000,
      mimetype: "png",
    },
  });
  //send mail
  await sendCreateAccountEmail({
    email: newCustomer.email,
    name: `${newCustomer.firstName} ${newCustomer.lastName}`,
  });
  await newCustomer.save();

  return {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Account created successfully",
    error: null,
    data: {
      user: {
        email: newCustomer.email,
        role: newCustomer.role,
        name: `${newCustomer.firstName} ${newCustomer.lastName}`,
      },
    },
  };
};

// forgot password service
export const forgotPasswordService = async (email: string) => {
  //! check if email is valid using zod
  //? check if email is valid using zod
  //todo check if email is valid using zod
  // * check if email is valid using zod

  const parsed = emailSchema.safeParse({ email }); //passing as object
  //return error if email is not valid formate
  if (!parsed.success) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "forgot password Validation error",
      {
        path: "body",
        value: z.treeifyError(parsed.error),
      }
    );
  }
  // 2 Find user by email
  const user = await customerInfoModel.findOne({ email }).select("-password");
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "invalid email or password");
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
  //!await sendForgotPasswordOTPEmail(email, otp, user.name);
  // Save the user document with the new OTP and expiration time
  await user.save();
  const forgotPasswordToken = generateForgotPasswordToken({
    email: user.email,
  });
  return { forgotPasswordToken };
};
export const verifyForgotPasswordOTPService = async (
  otp: string,
  email: string
) => {
  // 1 Find user by email
  const user = await customerInfoModel.findOne({ email }).select("+password");
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User Not found");
  }

  // 2 Check if active
  if (!user.isActive) {
    throw new ApiError(httpStatus.FORBIDDEN, "User account is deactivated");
  }
  // 3 check same otp and otp not expired
  if (user.otp !== otp) {
    throw new ApiError(httpStatus.BAD_REQUEST, "OTP is not valid");
  }
  if (user.otpExpiresAt && user.otpExpiresAt < new Date()) {
    throw new ApiError(httpStatus.BAD_REQUEST, "OTP has expired");
  }
  user.isForgotPasswordVerified = true; // Set the forgot password verification flag to true
  user.changePasswordExpiresAt = await otpExpireTime(); // Set the change password expiration time
  user.otp = undefined; // Clear the OTP after successful verification
  user.otpExpiresAt = undefined; // Clear the OTP expiration time
  await user.save();

  return {
    statusCode: httpStatus.OK,
    success: true,
    message: "OTP verified successfully",
    error: null,
    user: {},
  };
};
export const PasswordChangeService = async (
  password: string,
  email: string
) => {
  // 1 Find user by email
  const user = await customerInfoModel.findOne({ email });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User Not found22");
  }

  // 2 Check if active
  if (!user.isActive) {
    throw new ApiError(httpStatus.FORBIDDEN, "User account is deactivated");
  }
  if (!user.isForgotPasswordVerified) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Please verify OTP first");
  }
  // 3 password change time valid or not
  if (
    user.changePasswordExpiresAt &&
    user.changePasswordExpiresAt < new Date()
  ) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "password change time has expired"
    );
  }
  const hashedPassword = await hashPassword(password);
  user.password = hashedPassword;
  user.isForgotPasswordVerified = false;
  user.changePasswordExpiresAt = undefined;

  await user.save();

  return {
    statusCode: httpStatus.OK,
    success: true,
    message: "password change successfully",
    error: null,
    data: {
      accessToken: null,
      user: null,
    },
  };
};
//resend otp service
export const resendOTPService = async (email: string) => {
  // 1 Find user by email
  const user = await customerInfoModel.findOne({ email }).select("+password");
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
  //!await sendResendOTPEmail(email, otp, user.name);
  // Save the user document with the new OTP and expiration time
  await user.save();
  const forgotPasswordToken = generateForgotPasswordToken({
    email: user.email,
  });
  return {
    statusCode: httpStatus.OK,
    success: true,
    message: "resend otp successfully",
    error: null,
    data: {
      forgotPasswordToken: forgotPasswordToken,
      user: null,
    },
  };
};
//change password from profile as known the old password
export const changePassword_FromProfileService = async (
  password: string,
  email: string
) => {
  // 1 Find user by email
  const user = await customerInfoModel.findOne({ email });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User Not found");
  }

  // 2 Check if active
  if (!user.isActive) {
    throw new ApiError(httpStatus.FORBIDDEN, "User account is deactivated");
  }

  const hashedPassword = await hashPassword(password);
  user.password = hashedPassword;
  await user.save();
  const accessToken = generateAccessToken({
    id: user._id,
    role: user.role,
    email: user.email,
  });
  const userData = {
    id: user._id,
    name: user.firstName,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
  };
  return {
    statusCode: httpStatus.ACCEPTED,
    success: true,
    message: "password change successfully from profile",
    error: null,
    data: {
      accessToken,
      user: userData,
    },
  };
};
// refresh token service
export const refreshTokenService = async (refreshToken: string) => {
  //verify refresh token
  // Verify refresh token
  const decoded = jwt.verify(refreshToken, JWT_SECRET_KEY as string);
  if (typeof decoded === "string" || !("id" in decoded)) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid token payload");
  }

  const payload = decoded as JwtPayload & {
    id: string;
    email: string;
    role: string;
  };

  const accessToken = generateAccessToken({
    id: payload.id,
    role: payload.role,
    email: payload.email,
  });
  const new_refresh_Token = generateRefreshToken({
    id: payload.id,
    role: payload.role,
    email: payload.email,
  });
  //user info
  const user = await customerInfoModel.findById(payload.id);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User Not found");
  }
  const userData = {
    id: user._id,
    name: user.firstName,
    email: user.email,
    role: user.role,
  };
  return {
    statusCode: httpStatus.OK,
    success: true,
    message: "Access token refreshed successfully",
    error: null,
    new_refresh_Token: new_refresh_Token,
    data: {
      accessToken: accessToken,

      user: userData,
    },
  };
};
