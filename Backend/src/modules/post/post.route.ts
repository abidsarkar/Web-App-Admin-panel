import express from "express";
import {getAllPostsRateLimiter} from "../../middlewares/rateLimiter"
const router = express.Router();
import { createPost ,getAllPosts,getSinglePost} from "./post.controller";
router.post("/posts", createPost);
router.get("/all-posts",getAllPostsRateLimiter, getAllPosts);
router.get("/single-posts/:id",getAllPostsRateLimiter, getSinglePost);
export const postRoutes = router;
