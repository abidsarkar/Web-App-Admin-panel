//change in working interface file
import { Document, Types } from "mongoose";

export interface IProduct extends Document {
  _id: Types.ObjectId;
  productId?: string;
  productName?: string;
  productDescription?: string;
  productCoverImage?: {
    filePathURL: string;
    fileOriginalName: string;
    fileServerName: string;
    pathA?: string;
  };
   // 🖼️ Multiple Images
  productImages?: {
    filePathURL: string;
    fileOriginalName: string;
    fileServerName: string;
    pathA: string;
  }[];
  productSize?:string;
  productColor?:string;
  productColorCode?:string;
  productPrice?: number;
  productStock?: number;
  productCategoryId?: string;
  productSubCategoryId?: string;
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
  isSaleable:boolean;
  isDisplayable:boolean;
  createdAt: Date;
  updatedAt: Date;
}
