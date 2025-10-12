import { createPostService, getAllPostsService ,getSinglePostService} from "./post.service";
import { Request, Response } from "express";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import ApiError from "../../errors/ApiError";
export const createPost = catchAsync(async (req: Request, res: Response) => {
  const { title, description, category, imageUrl, pitch } = req.body;
  if (!title || !description || !category || !imageUrl || !pitch) {
    throw new ApiError(httpStatus.BAD_REQUEST, "All fields are required");
  }
  const { newPost } = await createPostService(
    title,
    description,
    category,
    imageUrl,
    pitch
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Post created successfully",
    data: newPost,
  });
});
// get all posts
export const getAllPosts = catchAsync(async (req: Request, res: Response) => {
  const { posts } = await getAllPostsService();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Posts retrieved successfully",
    data: posts,
  });
});
//get single post
export const getSinglePost = catchAsync(async (req: Request, res: Response) => {
  const {id} = req.params;
  if(!id){
    throw new ApiError(httpStatus.BAD_REQUEST,"Post id is required");
  }
  const {posts} = await getSinglePostService(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Post retrieved successfully",
    data: posts,
  });
});