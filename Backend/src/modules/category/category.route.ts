import express from "express";
const router = express.Router();
import {forgotPasswordRateLimiter, loginRateLimiter, otpResendRateLimiter} from "../../middlewares/rateLimiter"
import { verifyAccessTokenMiddleware, verifyForgotPasswordTokenMiddleware, verifyRefreshTokenMiddleware } from "../../middlewares/verifyTokenMiddleware";
import { createCategoryController, updateCategoryController } from "./category.controller";

router.post("/create",verifyAccessTokenMiddleware,createCategoryController);
router.patch("/update",verifyAccessTokenMiddleware,updateCategoryController);
export const categoryRouts = router;
