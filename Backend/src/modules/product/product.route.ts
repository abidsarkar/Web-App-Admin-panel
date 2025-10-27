import express from "express";
const router = express.Router();
import {forgotPasswordRateLimiter, loginRateLimiter, otpResendRateLimiter} from "../../middlewares/rateLimiter"
import { verifyAccessTokenMiddleware, verifyForgotPasswordTokenMiddleware, verifyRefreshTokenMiddleware } from "../../middlewares/verifyTokenMiddleware";
import { createProductController, uploadProductCoverPicController } from "./product.controller";
import { productCoverPictureUpload } from "../../multer/multer.upload";


router.post("/create",verifyAccessTokenMiddleware,createProductController);
router.patch("/upload-cover",productCoverPictureUpload,verifyAccessTokenMiddleware,uploadProductCoverPicController);
router.post("/upload-many",productCoverPictureUpload,verifyAccessTokenMiddleware,uploadProductCoverPicController);
export const productRouts = router;
