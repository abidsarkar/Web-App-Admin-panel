import { Request, Response, NextFunction } from "express";
import ApiError from "../errors/ApiError"; // Assuming you have an ApiError class for custom errors
import httpStatus from "http-status";

// roleCheckMiddleware to check the user's role against the required role
export const roleCheckMiddleware = (requiredRole: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Extract the role from req.user (set by the authenticateJWT middleware)
    const role = req.user?.role;
    
    if (!role) {
      return next(
        new ApiError(httpStatus.UNAUTHORIZED, "No role found in user data")
      );
    }

    if (role !== requiredRole) {
      return next(
        new ApiError(httpStatus.FORBIDDEN, "Access denied: Insufficient role.")
      );
    }
    // If roles match, allow the request to proceed to the next middleware/handler
    next();
  };
};
