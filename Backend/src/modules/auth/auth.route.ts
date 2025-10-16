import express from "express";
import {forgotPasswordRateLimiter, getAllPostsRateLimiter, loginRateLimiter, otpResendRateLimiter} from "../../middlewares/rateLimiter"
const router = express.Router();
import { loginController,forgotPasswordController, verifyForgotPasswordOTPController, changePasswordController, resendOTPController } from "./auth.controller";
import { verifyTokenMiddleware } from "../../middlewares/verifyTokenMiddleware";
import { verifyToken } from "../../utils/JwtToken";
router.post("/login", loginRateLimiter,loginController);
router.post("/forgot-password",forgotPasswordRateLimiter, forgotPasswordController);
router.post("/verify-forgot-password-otp", verifyForgotPasswordOTPController);
router.post("/change-password", changePasswordController);
router.post("/resend-otp",otpResendRateLimiter, resendOTPController);
export const authRoutes = router;
