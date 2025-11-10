import express from "express";
import {
  forgotPasswordRateLimiter,
  loginRateLimiter,
  otpResendRateLimiter,
  registerNewCustomerLimiter,
} from "../../middlewares/rateLimiter";
const router = express.Router();

import {
  verifyAccessTokenMiddleware,
  verifyForgotPasswordTokenMiddleware,
  verifyRefreshTokenMiddleware,
} from "../../middlewares/verifyTokenMiddleware";
import { loginTracker } from "../../logger/loginTracker";
import {
  changePassword_fromProfileCustomerController,
  changePasswordCustomerController,
  forgotPasswordCustomerController,
  loginCustomerController,
  logoutCustomerController,
  refreshTokenCustomerController,
  registerCustomerController,
  resendOTPCustomerController,
  verifyForgotPasswordOTPCustomerController,
} from "./customerAuth.controller";
import { roleCheckMiddleware } from "../../middlewares/roleCheckMiddleware";

router.post("/login", loginRateLimiter, loginCustomerController);
router.post(
  "/register",
  registerNewCustomerLimiter,
  registerCustomerController
);
router.post(
  "/forgot-password",
  forgotPasswordRateLimiter,
  forgotPasswordCustomerController
);
router.post(
  "/verify-forgot-password-otp",
  forgotPasswordRateLimiter,
  verifyForgotPasswordTokenMiddleware,
  verifyForgotPasswordOTPCustomerController
);
router.post(
  "/change-password",
  verifyForgotPasswordTokenMiddleware,
  changePasswordCustomerController
);
router.post("/resend-otp", otpResendRateLimiter, resendOTPCustomerController);
router.post(
  "/change-pass-from-profile",
  otpResendRateLimiter,
  verifyAccessTokenMiddleware,
  roleCheckMiddleware("customer"),
  changePassword_fromProfileCustomerController
);
router.post("/logout", logoutCustomerController);
router.post(
  "/refresh-token",
  verifyRefreshTokenMiddleware,
  roleCheckMiddleware("customer"),
  refreshTokenCustomerController
);
export const customerAuthRoutes = router;
