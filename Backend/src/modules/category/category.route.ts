import express from "express";
const router = express.Router();
import {forgotPasswordRateLimiter, loginRateLimiter, otpResendRateLimiter} from "../../middlewares/rateLimiter"
import { verifyAccessTokenMiddleware, verifyForgotPasswordTokenMiddleware, verifyRefreshTokenMiddleware } from "../../middlewares/verifyTokenMiddleware";
import { createCategoryController, createSubCategoryController, updateCategoryController, updateSubCategoryController } from "./category.controller";

router.post("/create",verifyAccessTokenMiddleware,createCategoryController);
router.post("/create-sub",verifyAccessTokenMiddleware,createSubCategoryController);
router.patch("/update",verifyAccessTokenMiddleware,updateCategoryController);
router.patch("/update-sub",verifyAccessTokenMiddleware,updateSubCategoryController);
export const categoryRouts = router;
