import express from "express";
const router = express.Router();
import {forgotPasswordRateLimiter, loginRateLimiter, otpResendRateLimiter} from "../../middlewares/rateLimiter"
import { verifyAccessTokenMiddleware, verifyForgotPasswordTokenMiddleware, verifyRefreshTokenMiddleware } from "../../middlewares/verifyTokenMiddleware";
import { createEmployerController, deleteEmployerInfoController, getEmployerInfoController, updateEmployerInfoController } from "./managedEmployer.controller";
import { adminRoleCheckMiddleware } from "../../middlewares/roleGuard";


router.post("/create-employee",adminRoleCheckMiddleware("superAdmin"), verifyAccessTokenMiddleware,createEmployerController);
router.get("/get-employee", verifyAccessTokenMiddleware,getEmployerInfoController);
router.patch("/update-employee", adminRoleCheckMiddleware("superAdmin"),verifyAccessTokenMiddleware,updateEmployerInfoController);
router.delete("/delete-employee", adminRoleCheckMiddleware("superAdmin"),verifyAccessTokenMiddleware,deleteEmployerInfoController);
export const employeeManagementRouts = router;
