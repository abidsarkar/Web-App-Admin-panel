import { Schema, model } from "mongoose";
import { IProduct } from "./product.interface";

const imageSchema = new Schema(
  {
    filePathURL: {
      type: String,
      default:
        "public/uploads/productCoverPicture/product-image-placeholder.jpg",
    },
    fileOriginalName: {
      type: String,
      default: "product-image-placeholder.jpg",
    },
    fileServerName: { type: String },
    mimetype: { type: String },
    size: { type: Number },
    pathA: { type: String },
  },
  { _id: true }
);

const productSchema = new Schema<IProduct>(
  {
    productId: { type: String, unique: true, required: true },
    productName: { type: String, required: true },
    productDescription: { type: String },
    productCoverImage: imageSchema,
    productImages: [imageSchema], // 👈 multiple images
    productSize: { type: String, default: null },
    productColor: { type: String, default: null },
    productColorCode: { type: String, default: null },
    productPrice: { type: Number, default: null },
    productStock: { type: Number, default: null },
    productCategoryId: {
      type: String,
      //ref: "Category",
      // required: false,
    },
    categoryName: {
      type: String,
      //ref: "SubCategory",
      //required: false,
    },
    productSubCategoryId: {
      type: String,
      //ref: "SubCategory",
      //required: false,
    },
    subCategoryName: {
      type: String,
      //ref: "SubCategory",
      //required: false,
    },
    productDeliveryOption: { type: String },
    productPaymentOption: { type: String },
    createdBy: {
      id: { type: String },
      role: { type: String },
      email: { type: String },
      createdAt: { type: Date, default: Date.now },
    },
    updatedBy: {
      id: { type: String },
      role: { type: String },
      email: { type: String },
      updatedAt: { type: Date, default: Date.now },
    },
    isSaleable: { type: Boolean, default: true },
    isDisplayable: { type: Boolean, default: true },
    searchKeyword: { type: String, default: null },
    extraComment: { type: String, default: null },
  },
  { timestamps: true, versionKey: false }
);

export const ProductModel = model<IProduct>("Product", productSchema);
