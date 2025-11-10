import express from "express";
const router = express.Router();
import {
  forgotPasswordRateLimiter,
  loginRateLimiter,
  otpResendRateLimiter,
} from "../../middlewares/rateLimiter";
import {
  verifyAccessTokenMiddleware,
  verifyForgotPasswordTokenMiddleware,
  verifyRefreshTokenMiddleware,
} from "../../middlewares/verifyTokenMiddleware";
import {
  createEmployerController,
  deleteEmployerInfoController,
  exportAllEmployeesController,
  getAllEmployerInfoController,
  getAllSupAdminEmployerInfoController,
  getEmployerInfoController,
  updateEmployerInfoController,
  updateEmployerProfilePicController,
} from "./managedEmployer.controller";
import { adminRoleCheckMiddleware } from "../../middlewares/roleGuard";
import {
  profilePictureUpload,
} from "../../multer/multer.upload";

router.post(
  "/create",
  adminRoleCheckMiddleware("superAdmin"),
  verifyAccessTokenMiddleware,
  profilePictureUpload,
  createEmployerController
);
router.get("/get", verifyAccessTokenMiddleware, getEmployerInfoController);
router.get(
  "/get-all",
  adminRoleCheckMiddleware("superAdmin"),
  verifyAccessTokenMiddleware,
  getAllEmployerInfoController
);
router.get(
  "/get-all-sup",
  adminRoleCheckMiddleware("superAdmin"),
  verifyAccessTokenMiddleware,
  getAllSupAdminEmployerInfoController
);
router.patch(
  "/update",
  adminRoleCheckMiddleware("superAdmin"),
  verifyAccessTokenMiddleware,
  updateEmployerInfoController
);
router.patch(
  "/update-profile-pic",
  adminRoleCheckMiddleware("superAdmin"),
  verifyAccessTokenMiddleware,
  profilePictureUpload,
  updateEmployerProfilePicController
);
router.delete(
  "/delete",
  adminRoleCheckMiddleware("superAdmin"),
  verifyAccessTokenMiddleware,
  deleteEmployerInfoController
);
router.get(
  "/export-employees",
  adminRoleCheckMiddleware("superAdmin"),
  verifyAccessTokenMiddleware, 
  exportAllEmployeesController
);
export const employeeManagementRouts = router;
