import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import { createPost } from "./post.controller";
import { PostModel } from "./post.model";
export const createPostService = async (
  title: string,
  description: string,
  category: string,
  imageUrl: string,
  pitch: string
) => {
  const newPost = new PostModel({
    title,
    description,
    category,
    imageUrl,
    pitch,
  });
  await newPost.save();
  return { newPost };
};
export const getAllPostsService = async () => {
  const posts = await PostModel.find();
  return { posts };
};
export const getSinglePostService = async (id: string) => {
  const posts = await PostModel.findByIdAndUpdate(
    id,
    { $inc: { view: 1 } },//increment view count by 1
    { new: true } // return the updated document
  );
  if (!posts) {
    throw new ApiError(httpStatus.NOT_FOUND, "Post not found");
  }
  return { posts };
};
