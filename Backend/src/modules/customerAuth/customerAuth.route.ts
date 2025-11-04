import express from "express";
import {forgotPasswordRateLimiter, loginRateLimiter, otpResendRateLimiter, registerNewCustomerLimiter} from "../../middlewares/rateLimiter"
const router = express.Router();

import { verifyAccessTokenMiddleware, verifyForgotPasswordTokenMiddleware, verifyRefreshTokenMiddleware } from "../../middlewares/verifyTokenMiddleware";
import { loginTracker } from "../../logger/loginTracker";
import { forgotPasswordCustomerController, loginCustomerController, registerCustomerController, verifyForgotPasswordOTPCustomerController } from "./customerAuth.controller";

router.post("/login", loginRateLimiter,loginCustomerController);
router.post("/register", registerNewCustomerLimiter,registerCustomerController);
router.post("/forgot-password", forgotPasswordRateLimiter,forgotPasswordCustomerController);
router.post("/verify-forgot-password-otp",verifyForgotPasswordTokenMiddleware, verifyForgotPasswordOTPCustomerController);
//router.post("/change-password", verifyForgotPasswordOTPCustomerController);
//router.post("/resend-otp",otpResendRateLimiter, verifyForgotPasswordOTPCustomerController);
//router.post("/change-pass-from-profile",otpResendRateLimiter,verifyAccessTokenMiddleware, verifyForgotPasswordOTPCustomerController);
//router.post("/logout", verifyForgotPasswordOTPCustomerController);
export const customerRoutes = router;
