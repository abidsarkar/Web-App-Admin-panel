import mongoose from "mongoose";
export interface IPost extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  pitch: string;
  view: number;
  
}
