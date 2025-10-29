import express from "express";
import {forgotPasswordRateLimiter, loginRateLimiter, otpResendRateLimiter} from "../../middlewares/rateLimiter"
const router = express.Router();
import { loginController,forgotPasswordController, verifyForgotPasswordOTPController, changePasswordController, resendOTPController, changePassword_fromProfileController, logoutController, refreshTokenController } from "./auth.controller";
import { verifyAccessTokenMiddleware, verifyForgotPasswordTokenMiddleware, verifyRefreshTokenMiddleware } from "../../middlewares/verifyTokenMiddleware";
import { loginTracker } from "../../logger/loginTracker";

router.post("/login", loginRateLimiter,loginTracker,loginController);
router.post("/forgot-password",forgotPasswordRateLimiter, forgotPasswordController);
router.post("/verify-forgot-password-otp",verifyForgotPasswordTokenMiddleware, verifyForgotPasswordOTPController);
router.post("/change-password", changePasswordController);
router.post("/resend-otp",otpResendRateLimiter, resendOTPController);
router.post("/change-pass-from-profile",otpResendRateLimiter,verifyAccessTokenMiddleware, changePassword_fromProfileController);
router.post("/logout", logoutController);
router.post("/refresh-token", verifyRefreshTokenMiddleware,refreshTokenController);
export const authRoutes = router;
