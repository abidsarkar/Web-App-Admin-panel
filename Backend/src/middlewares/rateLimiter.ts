import rateLimit from "express-rate-limit";
import httpStatus from "http-status";

// 1. Login Rate Limit (3 requests per 15 minutes)
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Allow 10 requests per 15 minutes
  message: "Too many login attempts, please try again later.",
  statusCode: httpStatus.TOO_MANY_REQUESTS, // Use 429 status code
});

// 2. OTP Rate Limit (5 requests per 1 minute)
export const otpResendRateLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minute
  max: 3, // Allow 3 OTP requests per minute
  message: "Too many OTP requests, please try again later.",
  statusCode: httpStatus.TOO_MANY_REQUESTS, // Use 429 status code
});

// 3. Forgot Password Rate Limit (3 requests per 30 minutes)
export const forgotPasswordRateLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 5, // Allow 3 password reset requests per 30 minutes
  message: "Too many forgot password attempts, please try again later.",
  statusCode: httpStatus.TOO_MANY_REQUESTS, // Use 429 status code
});
// 4. get all posts rate limit 30 requests per 15 minutes
export const getAllPostsRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Allow 30 requests per 15 minutes
  message: "Too many requests, please try again later.",
  statusCode: httpStatus.TOO_MANY_REQUESTS, // Use 429 status code
});
export const publicRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Allow 30 requests per 15 minutes
  message: "Too many requests, please try again later.",
  statusCode: httpStatus.TOO_MANY_REQUESTS, // Use 429 status code
});
//get text rate limiter
export const getAllTextRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Allow 30 requests per 15 minutes
  message: "Too many requests, please try again later. better to Cache the result",
  statusCode: httpStatus.TOO_MANY_REQUESTS, // Use 429 status code
});