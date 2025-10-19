import { Request, Response, NextFunction } from "express";
import jwt, { TokenExpiredError } from "jsonwebtoken";
import ApiError from "../errors/ApiError";
import httpStatus from "http-status";
import { JWT_SECRET_KEY } from "../config/envConfig";

// 1️⃣ Extend Express Request type safely
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

// 2️⃣ verify Refresh Token Middleware
export const verifyRefreshTokenMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extract from Authorization header ("Bearer <token>")
    let token = req.headers.authorization?.split(" ")[1];
    // Or from cookies (if stored there)
    if (!token) {
      token = req.cookies?.refreshToken || req.body?.refreshToken;
    }

    if (!token) {
      return next(
        new ApiError(httpStatus.UNAUTHORIZED, "Access denied. No Refresh token provided.")
      );
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      JWT_SECRET_KEY as string
    ) as { id: string; email: string; role: string };

    // Attach user data
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return next(new ApiError(httpStatus.UNAUTHORIZED, "Refresh Token has expired.!"));
    }

    return next(new ApiError(httpStatus.UNAUTHORIZED, "Invalid or malformed Refresh token."));
  }
};
//verify Access Token Middleware
export const verifyAccessTokenMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extract from Authorization header ("Bearer <token>")
    let token = req.headers.authorization?.split(" ")[1];

    // Or from cookies (if stored there)
    if (!token) {
      token = req.cookies?.accessToken || req.body?.accessToken;
    }

    if (!token) {
      return next(
        new ApiError(httpStatus.UNAUTHORIZED, "Access denied. No Access token provided.")
      );
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      JWT_SECRET_KEY as string
    ) as { id: string; email: string; role: string };

    // Attach user data
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return next(new ApiError(httpStatus.UNAUTHORIZED, "Access Token has expired."));
    }

    return next(new ApiError(httpStatus.UNAUTHORIZED, "Invalid or malformed Access token."));
  }
};
//verify forgot password Token Middleware
export const verifyForgotPasswordTokenMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extract from Authorization header ("Bearer <token>")
    let token = req.headers.authorization?.split(" ")[1];

    // Or from cookies (if stored there)
    if (!token) {
      token = req.cookies?.forgotPasswordToken || req.body?.forgotPasswordToken;
    }

    if (!token) {
      return next(
        new ApiError(httpStatus.UNAUTHORIZED, "Access denied. No Forgot password token provided.")
      );
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      JWT_SECRET_KEY as string
    ) as { id: string; email: string; role: string };

    // Attach user data
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return next(new ApiError(httpStatus.UNAUTHORIZED, "Forgot password Token has expired."));
    }

    return next(new ApiError(httpStatus.UNAUTHORIZED, "Invalid or malformed Forgot password token."));
  }
};