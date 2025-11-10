// src/models/cart/cart.interface.ts
import { Document, Types } from "mongoose";

export interface ICartItem {
  productId: string;
  productObjectId: Types.ObjectId;
  productName: string;
  pricePerUnit: number; // Current price at time of viewing
  quantity: number;
  totalPrice: number; // pricePerUnit * quantity
  productImage?: string;
  productStock: number;
  isAvailable: boolean;
  size?: string;
  color?: string;
  colorCode?: string;
}

export interface ICart extends Document {
  userId?: Types.ObjectId; // For logged-in users
  sessionId?: string; // For guest users
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