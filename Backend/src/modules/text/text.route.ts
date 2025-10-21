import express from "express";
const router = express.Router();
import { verifyAccessTokenMiddleware } from "../../middlewares/verifyTokenMiddleware";
import { createOrUpdateTextController } from "./text.controller";
import { adminRoleCheckMiddleware } from "../../middlewares/roleGuard";
import { getAllTextRateLimiter } from "../../middlewares/rateLimiter";

router.patch("/create",adminRoleCheckMiddleware("superAdmin"),
  verifyAccessTokenMiddleware,createOrUpdateTextController);
export const textRouts = router;
