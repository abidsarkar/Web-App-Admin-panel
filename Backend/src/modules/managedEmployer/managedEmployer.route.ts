import express from "express";
const router = express.Router();
import {forgotPasswordRateLimiter, loginRateLimiter, otpResendRateLimiter} from "../../middlewares/rateLimiter"
import { verifyAccessTokenMiddleware, verifyForgotPasswordTokenMiddleware, verifyRefreshTokenMiddleware } from "../../middlewares/verifyTokenMiddleware";
import { createEmployerController, getEmployerInfoController } from "./managedEmployer.controller";
import { adminRoleCheckMiddleware } from "../../middlewares/roleGuard";


router.post("/create-employee",adminRoleCheckMiddleware("superAdmin"), verifyAccessTokenMiddleware,createEmployerController);
router.get("/get-employee", verifyAccessTokenMiddleware,getEmployerInfoController);
export const employeeManagementRouts = router;
