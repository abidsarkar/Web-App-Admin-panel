import express from "express";
const router = express.Router();
import {forgotPasswordRateLimiter, loginRateLimiter, otpResendRateLimiter} from "../../middlewares/rateLimiter"
import { verifyAccessTokenMiddleware, verifyForgotPasswordTokenMiddleware, verifyRefreshTokenMiddleware } from "../../middlewares/verifyTokenMiddleware";
import { allProductAdminController, allProductController, createProductController, deleteProductController, deleteProductImageController, exportAllProductsController, getSingleProductAdminController, getSingleProductController, getSubCategoryProductController, replaceProductImageController, updateProductController, uploadProductCoverPicController, uploadProductManyPicController } from "./product.controller";
import { productCoverPictureUpload, uploadManyProductPic, uploadSingleReplaceImage } from "../../multer/multer.upload";

//admin
router.post("/create",verifyAccessTokenMiddleware,createProductController);
router.patch("/update",verifyAccessTokenMiddleware,updateProductController);
router.delete("/delete",verifyAccessTokenMiddleware,deleteProductController);
//public
router.get("/get-all",allProductController);
router.get("/get-single",getSingleProductController);
router.get("/get-sub",getSubCategoryProductController);
//admin
router.get("/get-all-admin",verifyAccessTokenMiddleware,allProductAdminController);
router.get("/get-single-admin",verifyAccessTokenMiddleware,getSingleProductAdminController);
router.patch("/upload-cover",productCoverPictureUpload,verifyAccessTokenMiddleware,uploadProductCoverPicController);
router.patch("/upload-many",uploadManyProductPic,verifyAccessTokenMiddleware,uploadProductManyPicController);
router.delete("/delete-many",verifyAccessTokenMiddleware,deleteProductImageController);
router.patch("/replace-many",uploadSingleReplaceImage,verifyAccessTokenMiddleware,replaceProductImageController);
//export to excel
// Add to your product routes
router.get("/export", verifyAccessTokenMiddleware, exportAllProductsController);
export const productRouts = router;
