import express from "express";
import {getAllPostsRateLimiter} from "../../middlewares/rateLimiter"
const router = express.Router();
import { loginController } from "./auth.controller";
router.post("/login", loginController);
export const authRoutes = router;
