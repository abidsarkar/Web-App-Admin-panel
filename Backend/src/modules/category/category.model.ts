// src/models/category.model.ts
import mongoose, { Schema } from "mongoose";
import { ICategory, ISubCategory } from "./category.interface";

const subCategorySchema = new Schema<ISubCategory>(
  {
    subCategoryName: { type: String, required: true, trim: true },
    subCategoryId: { type: String, required: true, unique: true },
    categoryId: { type: String, required: true },
    categoryName:{type:String},
    createdBy: {
      id: String,
      role: String,
      email: String,
    },
    updatedBy: {
      id: String,
      role: String,
      email: String,
      updatedAt: Date,
    },
  },
  { timestamps: true, versionKey: false }
);

export const SubCategoryModel = mongoose.model<ISubCategory>(
  "SubCategory",
  subCategorySchema
);

const categorySchema = new Schema<ICategory>(
  {
    categoryName: { type: String, required: true, trim: true },
    categoryId: { type: String, required: true, unique: true },
    subCategories: [{ type: Schema.Types.ObjectId, ref: "SubCategory" }],
    createdBy: {
      id: String,
      role: String,
      email: String,
    },
    updatedBy: {
      id: String,
      role: String,
      email: String,
      updatedAt: Date,
    },
  },
  { timestamps: true, versionKey: false }
);

export const CategoryModel = mongoose.model<ICategory>(
  "Category",
  categorySchema
);
