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

import { adminRoleCheckMiddleware } from "../../middlewares/roleGuard";
import {
  customerProfilePictureUpload,
  profilePictureUpload,
} from "../../multer/multer.upload";
import {
    deleteCustomerProfileController,
  getAllCustomerInfoController,
  getProfileManagedCustomerController,
  getProfileManagedCustomerController_Admin,
  updateCustomerProfilePicController,
  updateManagedCustomerController,
} from "./managedCustomer.controller";
import {
  roleCheckMiddleware,
  roleCheckMiddlewareAdmins,
} from "../../middlewares/roleCheckMiddleware";

router.get(
  "/get",
  verifyAccessTokenMiddleware,
  roleCheckMiddleware("customer"),
  getProfileManagedCustomerController
);
router.get(
  "/get-admin",
  verifyAccessTokenMiddleware,
  roleCheckMiddlewareAdmins("superAdmin","editor"),
  getProfileManagedCustomerController_Admin
);
router.get(
  "/get-all-admin",
  verifyAccessTokenMiddleware,
  roleCheckMiddlewareAdmins("superAdmin","editor"),
  getAllCustomerInfoController
);
router.patch(
  "/update",
  verifyAccessTokenMiddleware,
  roleCheckMiddleware("customer"),
  updateManagedCustomerController
);
router.patch(
  "/update-profile-pic",
  verifyAccessTokenMiddleware,
  roleCheckMiddleware("customer"),
  customerProfilePictureUpload,
  updateCustomerProfilePicController
);
// router.get(
//   "/get-all",
//   adminRoleCheckMiddleware("superAdmin"),
//   verifyAccessTokenMiddleware,
//   getProfileManagedCustomerController
// );
// router.get(
//   "/get-all-sup",
//   adminRoleCheckMiddleware("superAdmin"),
//   verifyAccessTokenMiddleware,
//   getProfileManagedCustomerController
// );

router.delete(
  "/delete",
  verifyAccessTokenMiddleware,
  roleCheckMiddleware("customer"),
  deleteCustomerProfileController
);
export const customerManagementRouts = router;
