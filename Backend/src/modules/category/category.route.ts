import express from "express";
const router = express.Router();
import { publicRateLimiter } from "../../middlewares/rateLimiter";
import {
  verifyAccessTokenMiddleware,
  verifyForgotPasswordTokenMiddleware,
  verifyRefreshTokenMiddleware,
} from "../../middlewares/verifyTokenMiddleware";
import {
  createCategoryController,
  createSubCategoryController,
  deleteCategoryController,
  deleteSubCategoryController,
  getCategoryController,
  getCategoryForAdminController,
  getSubCategoryController,
  getSubCategoryForAdminController,
  updateCategoryController,
  updateSubCategoryController,
} from "./category.controller";
import {
  roleCheckMiddleware,
  roleCheckMiddlewareAdmins,
} from "../../middlewares/roleCheckMiddleware";
//category
router.post(
  "/create",
  verifyAccessTokenMiddleware,
  roleCheckMiddlewareAdmins("superAdmin", "editor", "subAdmin"),
  createCategoryController
);
router.get(
  "/get",
  publicRateLimiter,
  verifyAccessTokenMiddleware,
  getCategoryController
);
router.get(
  "/get-admin",
  verifyAccessTokenMiddleware,
  roleCheckMiddlewareAdmins("superAdmin", "editor", "subAdmin", "undefined"),
  getCategoryForAdminController
);
router.patch(
  "/update",
  verifyAccessTokenMiddleware,
  roleCheckMiddlewareAdmins("superAdmin", "editor", "subAdmin"),
  updateCategoryController
);
router.delete(
  "/delete",
  verifyAccessTokenMiddleware,
  roleCheckMiddlewareAdmins("superAdmin", "editor"),
  deleteCategoryController
);
//sub category
router.post(
  "/create-sub",
  verifyAccessTokenMiddleware,
  roleCheckMiddlewareAdmins("superAdmin", "editor", "subAdmin"),
  createSubCategoryController
);
router.patch(
  "/update-sub",
  verifyAccessTokenMiddleware,
  updateSubCategoryController
);
router.get(
  "/get-sub",
  publicRateLimiter,
  verifyAccessTokenMiddleware,
  getSubCategoryController
);
router.get(
  "/get-sub-admin",
  verifyAccessTokenMiddleware,
  roleCheckMiddlewareAdmins("superAdmin", "editor", "subAdmin"),
  getSubCategoryForAdminController
);
router.delete(
  "/delete-sub",
  verifyAccessTokenMiddleware,
  deleteSubCategoryController
);

export const categoryRouts = router;
