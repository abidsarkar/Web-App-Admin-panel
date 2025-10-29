import express from "express";
const router = express.Router();
import {forgotPasswordRateLimiter, loginRateLimiter, otpResendRateLimiter} from "../../middlewares/rateLimiter"
import { verifyAccessTokenMiddleware, verifyForgotPasswordTokenMiddleware, verifyRefreshTokenMiddleware } from "../../middlewares/verifyTokenMiddleware";
import { createProductController, deleteProductController, deleteProductImageController, replaceProductImageController, updateProductController, uploadProductCoverPicController, uploadProductManyPicController } from "./product.controller";
import { productCoverPictureUpload, uploadManyProductPic, uploadSingleReplaceImage } from "../../multer/multer.upload";


router.post("/create",verifyAccessTokenMiddleware,createProductController);
router.patch("/update",verifyAccessTokenMiddleware,updateProductController);
router.delete("/delete",verifyAccessTokenMiddleware,deleteProductController);
router.patch("/upload-cover",productCoverPictureUpload,verifyAccessTokenMiddleware,uploadProductCoverPicController);
router.patch("/upload-many",uploadManyProductPic,verifyAccessTokenMiddleware,uploadProductManyPicController);
router.delete("/delete-many",verifyAccessTokenMiddleware,deleteProductImageController);
router.patch("/replace-many",uploadSingleReplaceImage,verifyAccessTokenMiddleware,replaceProductImageController);
export const productRouts = router;
