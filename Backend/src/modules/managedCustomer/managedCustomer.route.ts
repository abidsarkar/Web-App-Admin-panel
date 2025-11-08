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
import { profilePictureUpload } from "../../multer/multer.upload";
import {
  getProfileManagedCustomerController,
  getProfileManagedCustomerController_Admin,
  updateProfileManagedCustomerController,
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
  roleCheckMiddlewareAdmins("superAdmin", "subAdmin"),
  getProfileManagedCustomerController_Admin
);
router.patch(
  "/update",
  verifyAccessTokenMiddleware,
  roleCheckMiddleware("customer"),
  updateProfileManagedCustomerController
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
// router.patch(
//   "/update",
//   adminRoleCheckMiddleware("superAdmin"),
//   verifyAccessTokenMiddleware,
//   getProfileManagedCustomerController
// );
// router.patch(
//   "/update-profile-pic",
//   adminRoleCheckMiddleware("superAdmin"),
//   verifyAccessTokenMiddleware,
//   profilePictureUpload,
//   getProfileManagedCustomerController
// );
// router.delete(
//   "/delete",
//   adminRoleCheckMiddleware("superAdmin"),
//   verifyAccessTokenMiddleware,
//   getProfileManagedCustomerController
// );
export const customerManagementRouts = router;
