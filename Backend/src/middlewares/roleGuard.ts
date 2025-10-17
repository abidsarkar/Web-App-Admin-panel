import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import ApiError from "../errors/ApiError";
import httpStatus from 'http-status';

// Extend Express Request interface to include 'user'
declare global {
  namespace Express {
    interface Request {
      // @ts-ignore
      user?: jwt.JwtPayload;
    }
  }
}

export interface IUserPayload extends jwt.JwtPayload {
  id: string;
  role: string;
  email: string;
}

type Role = "admin" | "manager" | "user"| "jobSeeker" | "employer"; // Define your roles here
type Roles = Role | Role[]; // single or multiple roles


// Middleware to guard the role
export const guardRole = (roles: Roles) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Access denied. No token provided.");
    }

    try {
      // Decode the token and cast it to IUserPayload
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as string) as IUserPayload;

      // Attach the decoded payload to the request object
      req.user = decoded;
      
      const userRole = decoded.role; // Get role from decoded token

      // Check if the user has one of the allowed roles
      if (Array.isArray(roles)) {
        if (roles.includes(userRole as Role)) {
          return next(); // If the role matches, proceed to the next middleware
        }
      } else if (roles === userRole) {
        return next(); // If it's a single role match, proceed to the next middleware
      }

      throw new ApiError(httpStatus.FORBIDDEN, "You are not authorized to access this resource.");

    } catch (error) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid token or session expired.");
    }
  };
};
export const RoleCheckMiddleware = (roles: Roles) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Access denied. No token provided.");
    }

    try {
      // Decode the token and cast it to IUserPayload
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as string) as IUserPayload;

      // Attach the decoded payload to the request object
      req.user = decoded;

      const userRole = decoded.role; // Get role from decoded token

      // Check if the user has one of the allowed roles
      if (Array.isArray(roles)) {
        if (roles.includes(userRole as Role)) {
          return next(); // If the role matches, proceed to the next middleware
        }
      } else if (roles === userRole) {
        return next(); // If it's a single role match, proceed to the next middleware
      }

      throw new ApiError(httpStatus.FORBIDDEN, "You are not authorized to access this resource.");

    } catch (error) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid token or session expired.");
    }
  };
};