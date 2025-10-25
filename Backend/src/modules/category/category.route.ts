import express from "express";
const router = express.Router();
import { publicRateLimiter,} from "../../middlewares/rateLimiter"
import { verifyAccessTokenMiddleware, verifyForgotPasswordTokenMiddleware, verifyRefreshTokenMiddleware } from "../../middlewares/verifyTokenMiddleware";
import { createCategoryController, createSubCategoryController, deleteCategoryController, deleteSubCategoryController, getCategoryController, getCategoryForAdminController, getSubCategoryController, getSubCategoryForAdminController, updateCategoryController, updateSubCategoryController } from "./category.controller";
//category
router.post("/create",verifyAccessTokenMiddleware,createCategoryController);
router.get("/get",publicRateLimiter,verifyAccessTokenMiddleware,getCategoryController);
router.get("/get-admin",verifyAccessTokenMiddleware,getCategoryForAdminController);
router.patch("/update",verifyAccessTokenMiddleware,updateCategoryController);
router.delete("/delete",verifyAccessTokenMiddleware,deleteCategoryController);
//sub category
router.post("/create-sub",verifyAccessTokenMiddleware,createSubCategoryController);
router.patch("/update-sub",verifyAccessTokenMiddleware,updateSubCategoryController);
router.get("/get-sub",publicRateLimiter,verifyAccessTokenMiddleware,getSubCategoryController);
router.get("/get-sub-admin",verifyAccessTokenMiddleware,getSubCategoryForAdminController);
router.delete("/delete-sub",verifyAccessTokenMiddleware,deleteSubCategoryController);

export const categoryRouts = router;
