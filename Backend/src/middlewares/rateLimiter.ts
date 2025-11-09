import { error } from "console";
import rateLimit from "express-rate-limit";
import httpStatus from "http-status";
import { success } from "zod";

// 1. Login Rate Limit (3 requests per 15 minutes)
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  statusCode: httpStatus.TOO_MANY_REQUESTS,
  message: {
    success: false,
    error: "Too many login attempts, please try again later after 15 minute.",
    message: "rate limiting error",
  },
  //keyGenerator: (req) => req.ip, // default
  skipSuccessfulRequests: true, // ✅ only count failed login attempts
});

// 2. OTP Rate Limit (5 requests per 1 minute)
export const otpResendRateLimiter = rateLimit({
  windowMs: 20 * 60 * 1000, // 20 minute
  max: 3, // Allow 3 OTP requests per minute
  message: {
    success: false,
    error:
      "Too many otp resend attempts, please try again later after 20 minute.",
    message: "rate limiting error",
  },
  statusCode: httpStatus.TOO_MANY_REQUESTS, // Use 429 status code
});

// 3. Forgot Password Rate Limit (3 requests per 30 minutes)
export const forgotPasswordRateLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 5, // Allow 3 password reset requests per 30 minutes
  message: {
    success: false,
    error:
      "Too many forgot password attempts, please try again later after 30 minute.",
    message: "rate limiting error",
  },

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
  message:
    "Too many requests, please try again later. better to Cache the result",
  statusCode: httpStatus.TOO_MANY_REQUESTS, // Use 429 status code
});
export const globalRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: "Too many requests from this IP, please try again later.",
    message: "rate limiting error",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  statusCode: httpStatus.TOO_MANY_REQUESTS, // Use 429 status code
  skipSuccessfulRequests: true,
});
export const registerNewCustomerLimiter = rateLimit({
  windowMs: 1 * 60 * 60 * 1000, // 1 hour
  max: 2, // Allow 2 requests per 1 hour
  message: {
    success: false,
    error: "Too many account create attempts, please try again later",
    message: "register New Customer  Limiter  error",
  },
  statusCode: httpStatus.TOO_MANY_REQUESTS, // Use 429 status code
});
