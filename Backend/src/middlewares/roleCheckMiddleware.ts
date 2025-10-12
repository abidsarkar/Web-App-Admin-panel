import { Request, Response, NextFunction } from 'express';
import ApiError from '../errors/ApiError'; // Assuming you have an ApiError class for custom errors
import httpStatus from 'http-status';

// roleCheckMiddleware to check the user's role against the required role
export const roleCheckMiddleware = (requiredRole: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Extract the role from req.user (set by the authenticateJWT middleware)
    const { role }:any = req.user;

    // Check if the role from the JWT matches the required role for the route
    if (role !== requiredRole) {
      // If roles don't match, return a Forbidden error
      return next(new ApiError(httpStatus.FORBIDDEN, `Access denied: Insufficient role. You must be a ${requiredRole}`));
    }

    // If roles match, allow the request to proceed to the next middleware/handler
    next();
  };
};
