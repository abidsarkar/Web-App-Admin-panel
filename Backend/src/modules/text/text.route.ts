import express from "express";
const router = express.Router();
import { verifyAccessTokenMiddleware } from "../../middlewares/verifyTokenMiddleware";
import {
  createOrUpdateTextController,
  getTextController,
} from "./text.controller";
import { adminRoleCheckMiddleware } from "../../middlewares/roleGuard";
import { getAllTextRateLimiter } from "../../middlewares/rateLimiter";

router.patch(
  "/create-update",
  adminRoleCheckMiddleware("superAdmin"),
  verifyAccessTokenMiddleware,
  createOrUpdateTextController
);
router.get("/get", getAllTextRateLimiter, getTextController);
export const textRouts = router;
