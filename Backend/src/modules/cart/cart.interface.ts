// src/models/cart/cart.interface.ts
import { Document, Types } from "mongoose";

export interface ICartItem {
  productId: string;
  productObjectId: Types.ObjectId;// this is mongodb id for that product
  productName: string;
  pricePerUnit: number;
  quantity: number;
  totalPrice: number;
  productImage?: string;
  size?: string;
  color?: string;
}

export interface ICart extends Document {
  userId?: Types.ObjectId;
  items: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
}

