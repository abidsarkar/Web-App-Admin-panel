import express from "express";
import {forgotPasswordRateLimiter, loginRateLimiter, otpResendRateLimiter, registerNewCustomerLimiter} from "../../middlewares/rateLimiter"
const router = express.Router();

import { verifyAccessTokenMiddleware, verifyForgotPasswordTokenMiddleware, verifyRefreshTokenMiddleware } from "../../middlewares/verifyTokenMiddleware";
import { loginTracker } from "../../logger/loginTracker";
import { loginCustomerController, registerCustomerController } from "./customerAuth.controller";

router.post("/login", loginRateLimiter,loginCustomerController);
router.post("/register", registerNewCustomerLimiter,registerCustomerController);

export const customerRoutes = router;
