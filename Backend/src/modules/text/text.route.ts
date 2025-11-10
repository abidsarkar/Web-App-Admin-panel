import express from "express";
const router = express.Router();
import { verifyAccessTokenMiddleware } from "../../middlewares/verifyTokenMiddleware";
import {
  createOrUpdateTextController,
  exportAllTextContentController,
  getTextController,
} from "./text.controller";
import { getAllTextRateLimiter } from "../../middlewares/rateLimiter";
import { roleCheckMiddlewareAdmins } from "../../middlewares/roleCheckMiddleware";
import { adminRoleCheckMiddleware } from "../../middlewares/roleGuard";


router.patch(
  "/create-update",
  verifyAccessTokenMiddleware,
  roleCheckMiddlewareAdmins("superAdmin", "subAdmin", "editor"),
  createOrUpdateTextController
);
router.get("/get", getAllTextRateLimiter, getTextController);
router.get(
  "/get-all",
  verifyAccessTokenMiddleware,
  roleCheckMiddlewareAdmins("superAdmin", "subAdmin", "editor","undefined"),
  getTextController
);
router.get(
  "/export",
  verifyAccessTokenMiddleware,
  adminRoleCheckMiddleware("superAdmin"),
  exportAllTextContentController
);
export const textRouts = router;
