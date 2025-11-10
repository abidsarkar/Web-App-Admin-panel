// src/models/cart/cart.interface.ts
import { Document, Types } from "mongoose";

export interface ICartItem {
  productId: string;
  productObjectId: Types.ObjectId;
  productName: string;
  pricePerUnit: number;
  quantity: number;
  totalPrice: number;
  productImage?: string;
  productStock: number;
  isAvailable: boolean;
  size?: string;
  color?: string;
  colorCode?: string;
}

export interface ICart extends Document {
  userId?: Types.ObjectId;
  sessionId?: string;
  items: ICartItem[];
  cartTotal: number;
  totalItems: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGuestCart {
  sessionId: string;
  items: Omit<ICartItem, 'productObjectId'> & { productObjectId: string };
  cartTotal: number;
  totalItems: number;
}