import express from "express";
const router = express.Router();
import {forgotPasswordRateLimiter, loginRateLimiter, otpResendRateLimiter} from "../../middlewares/rateLimiter"
import { verifyAccessTokenMiddleware, verifyForgotPasswordTokenMiddleware, verifyRefreshTokenMiddleware } from "../../middlewares/verifyTokenMiddleware";
import { createCategoryController, createSubCategoryController, deleteCategoryController, getCategoryController, getCategoryForAdminController, updateCategoryController, updateSubCategoryController } from "./category.controller";
//category
router.post("/create",verifyAccessTokenMiddleware,createCategoryController);
router.get("/get",verifyAccessTokenMiddleware,getCategoryController);
router.get("/get-admin",verifyAccessTokenMiddleware,getCategoryForAdminController);
router.patch("/update",verifyAccessTokenMiddleware,updateCategoryController);
router.delete("/delete",verifyAccessTokenMiddleware,deleteCategoryController);
//sub category
router.post("/create-sub",verifyAccessTokenMiddleware,createSubCategoryController);
router.patch("/update-sub",verifyAccessTokenMiddleware,updateSubCategoryController);
export const categoryRouts = router;
