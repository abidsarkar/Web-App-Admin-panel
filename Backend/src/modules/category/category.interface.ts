// src/interfaces/category.interface.ts
import { Document, Types } from "mongoose";

export interface ISubCategory extends Document {
  _id: Types.ObjectId;
  subCategoryName: string;
  subCategoryId: string;
  categoryId: string; // reference to parent category
  categoryName: string; // reference to parent category
  createdBy?: {
    id: string;
    role: string;
    email: string;
  };
  updatedBy?: {
    id: string;
    role: string;
    email: string;
    updatedAt: Date;
  };
}

export interface ICategory extends Document {
  _id: Types.ObjectId;
  categoryName: string;
  categoryId: string;
  subCategories?: Types.ObjectId[]; // references SubCategory documents
  createdBy?: {
    id: string;
    role: string;
    email: string;
  };
  updatedBy?: {
    id: string;
    role: string;
    email: string;
    updatedAt: Date;
  };
  createdAt: Date;
  updatedAt?: Date;
}
