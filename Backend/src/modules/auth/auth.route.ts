import express from "express";
import {forgotPasswordRateLimiter, getAllPostsRateLimiter} from "../../middlewares/rateLimiter"
const router = express.Router();
import { loginController,forgotPasswordController } from "./auth.controller";
router.post("/login", loginController);
router.post("/forgot-password",forgotPasswordRateLimiter, forgotPasswordController);
export const authRoutes = router;
