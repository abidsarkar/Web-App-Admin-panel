import express from "express";
const router = express.Router();
import { verifyAccessTokenMiddleware } from "../../middlewares/verifyTokenMiddleware";
import {
  createOrUpdateTextController,
  getTextController,
} from "./text.controller";
import { getAllTextRateLimiter } from "../../middlewares/rateLimiter";
import { roleCheckMiddlewareAdmins } from "../../middlewares/roleCheckMiddleware";

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
export const textRouts = router;
