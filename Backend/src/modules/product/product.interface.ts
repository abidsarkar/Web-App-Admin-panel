//change in working interface file
import { Document, Types } from "mongoose";

export interface IProduct extends Document {
  _id: Types.ObjectId;
  productId?: string;
  productName?: string;
  productDescription?: string;
  productCoverImage?: {
    _id: Types.ObjectId;
    filePathURL: string;
    fileOriginalName: string;
    fileServerName: string;
    size: number;
    mimetype: string;
    pathA?: string;
  };
  // 🖼️ Multiple Images
  productImages?: {
    _id: Types.ObjectId;
    filePathURL: string;
    fileOriginalName: string;
    fileServerName: string;
    size: number;
    mimetype: string;
    pathA: string;
  }[];
  productSize?: string;
  productColor?: string;
  productColorCode?: string;
  productPrice?: number;
  productStock?: number;
  productCategoryId?: string;
  productSubCategoryId?: string;
  categoryName?: string;
  subCategoryName?: string;
  productDeliveryOption?: string;
  productPaymentOption?: string;
  createdBy?: {
    id: string;
    role: string;
    email: string;
    createdAt: Date;
  };
  updatedBy?: {
    id: string;
    role: string;
    email: string;
    updatedAt: Date;
  };
  isSaleable: boolean;
  isDisplayable: boolean;
  createdAt: Date;
  updatedAt: Date;
}
