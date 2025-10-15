import { Secret, sign, verify } from "jsonwebtoken";
import dotenv, { config } from "dotenv";
import { JWT_SECRET_KEY } from "../config/envConfig";
import httpStatus from "http-status";

import jwt from "jsonwebtoken";
import { NextFunction, Request } from "express";

import ApiError from "../errors/ApiError";

dotenv.config();

export type TokenData = {
  id: string;
  name: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
};

const secret = JWT_SECRET_KEY as string;
if (!secret) throw new Error("JWT_SECRET_KEY is not defined");
export function generateAccessToken({
  id,
  role,
  email,
}: {
  id: string | any;
  role: string;
  email: string;
}): string {
  try {
    const token = jwt.sign({ id, role, email }, JWT_SECRET_KEY as string, {
      expiresIn: '1h',
    });
    return token;
  } catch (error) {
    console.error("JWT Sign Error:", error);
    throw new Error("Failed to generate access token!!");
  }
}
export function generateRefreshToken({
  id,
  role,
  email,
}: {
  id: string | any;
  role: string;
  email: string;
}): string {
  try {
    return jwt.sign({ id, role, email }, JWT_SECRET_KEY as string, {
      expiresIn: '7d',
    });
  } catch (error) {
    console.error("JWT Sign Error:", error);
    throw new Error("Failed to generate refresh token");
  }
}
export function generateForgotPasswordToken({
email
}: {
  email: string;
}): string {
  try {
    const token = jwt.sign({ email }, JWT_SECRET_KEY as string, {
      expiresIn: '5m',
    });
    return token;
  } catch (error) {
    console.error("JWT Sign Error:", error);
    throw new Error("Failed to generate forgot password token!!");
  }
}
export function verifySocketToken(token: string) {
  try {
    return verify(token, secret) as TokenData;
  } catch (error) {
    console.error(error);
    return null;
  }
}
export const verifyToken = (
  authHeader: string | undefined
): { id?: string; email?: string } => {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    const errorMessage = "No token provided or invalid format.";
    throw { statusCode: httpStatus.UNAUTHORIZED, message: errorMessage };
  }
  const token = authHeader.split(" ")[1];
  //console.log(token, "token");
  try {
    const decoded = jwt.verify(token, JWT_SECRET_KEY as string) as {
      id?: string;
      email?: string;
    };
    return decoded;
  } catch (error) {
    //console.log(error,"error---------->");
    throw new ApiError(498, "Invalid or expired token."); //-> 498 code is only for token expired status
  }
};


// export const generateAccessToken = (payload: any): string => {
//   return jwt.sign(payload, JWT_SECRET_KEY as string, { expiresIn: "7d" }); // 1 hour
// };

// export const generateAccessRefreshToken = async (userId: string) => {
//   try {
//     const user = await UserModel.findById(userId);
//     const accesstoken = generateAccessToken({
//       id: user._id,
//       name: user.name,
//       email: user.email,
//       role: user.role,
//     });
//     const refreshToken = generateRefreshToken({
//       id: user._id,
//       name: user.name,
//       email: user.email,
//       role: user.role,
//     });

//     user.refreshToken = refreshToken;
//     await user.save({ validateBeforeSave: false });
//     return { accesstoken, refreshToken };
//   } catch (error) {
//     throw new Error("failed during create access and refresh token");
//   }
// };
//---------> middleware
// export const verifyToken = async (
//   authHeader: string | undefined,
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     const errorMessage =
//       "No token provided or invalid format.";
//     throw { statusCode: httpStatus.UNAUTHORIZED, message: errorMessage };
//   }

//   const token = authHeader.split(" ")[1];
//   try {
//     const decoded = jwt.verify(token, JWT_SECRET_KEY as string) as {
//       id?: string;
//       email?: string;
//     };
//     const userId = decoded.id as string; // Assuming the token contains the userId

//   // Find the user by userId
//   const user = await findUserById(userId);
//   if (!user) {
//    throw new Error ("User not found.")
//   }
//     req.user = user
//     next();

//   } catch (error) {
//     const errorMessage =
//       "Invalid or expired token.";
//     throw { statusCode: httpStatus.UNAUTHORIZED, message: errorMessage };
//   }
// };

const expiresInOneHourForLogin = 365 * 24 * 60 * 60;
export function generateTokenForLogin({
  id,
  name,
  email,
  role,
}: Omit<TokenData, "iat" | "exp">) {
  return sign({ id, name, email, role }, secret, {
    expiresIn: expiresInOneHourForLogin,
  });
}
