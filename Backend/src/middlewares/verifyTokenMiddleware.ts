import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import ApiError from "../errors/ApiError";
import httpStatus from "http-status";
// Define the DecodedToken interface
interface DecodedToken {
  id: string;
  email: string;
  role: string;
}
// Middleware to verify token from both headers and cookies
export const verifyTokenMiddleware = (req: Request, res: Response, next: NextFunction) => {
  let token = req.headers.authorization?.split(" ")[1]; // Extract token from Authorization header

  // If token is not in the header, check if it's in cookies
  if (!token && req.cookies.token) {
    token = req.cookies.token;
  }

  // If token is not found, throw an error
  if (!token) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Access denied. No token provided.");
  }

  try {
    // Verify the token and decode the payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as string) as DecodedToken;

    // Attach the decoded payload to the request object
    req.user = {
      id:decoded.id,
      email:decoded.email,
      role:decoded.role,
    };

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      // Handle token expiration separately
      throw new ApiError(httpStatus.UNAUTHORIZED, "Token has expired.");
    }
    // Handle other token errors (invalid token)
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid token.");
  }
};
