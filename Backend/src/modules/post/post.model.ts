import mongoose from "mongoose";
import { IPost } from "./post.interface";
const postSchema = new mongoose.Schema<IPost>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    imageUrl: { type: String, required: true },
    pitch: { type: String, required: true },
    view: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);
export const PostModel = mongoose.model<IPost>("Post", postSchema);