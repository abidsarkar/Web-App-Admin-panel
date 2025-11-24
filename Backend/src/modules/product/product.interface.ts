//src/modules/product/product.interface.ts
//change in working interface file
import { Document, Types } from "mongoose";
//! for now i want to skip the variant of product
export interface IProductVariant {
  _id: Types.ObjectId;
  variantId: string;
  size?: string;
  color?: string;
  colorCode?: string;
  price: number;
  stock: number;
  sku: string;
  images?: {
    _id: Types.ObjectId;
    filePathURL: string;
    fileOriginalName: string;
    fileServerName: string;
    size: number;
    mimetype: string;
   
  }[];
  isActive: boolean;
}
//! for now i want to skip the variant of product

export interface IProduct extends Document {
  _id: Types.ObjectId;
  productId?: string;//every product must have there own unique id
  productName?: string;
  productDescription?: string;
  productCoverImage?: {
    _id: Types.ObjectId;
    filePathURL: string;
    fileOriginalName: string;
    fileServerName: string;
    size: number;
    mimetype: string;
    
  };
  // 🖼️ Multiple Images
  productImages?: {
    _id: Types.ObjectId;
    filePathURL: string;
    fileOriginalName: string;
    fileServerName: string;
    size: number;
    mimetype: string;
    
  }[];
  //! 🎯 Now supporting multiple variants
  //!variants: IProductVariant[];
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
  searchKeyword:string;
  extraComment:string;
  createdAt: Date;
  updatedAt: Date;
}
