import { Document, Types } from "mongoose";

export enum OrderStatus {
  Pending = "Pending",
  Processing = "Processing",
  Shipped = "Shipped",
  Delivered = "Delivered",
  Cancelled = "Cancelled",
}

export enum PaymentStatus {
  Pending = "Pending",
  Paid = "Paid",
  Failed = "Failed",
}

export enum PaymentMethod {
  COD = "COD",
  Prepaid = "Prepaid",
  bKash = "bKash",
  Nagad = "Nagad",
  Rocket = "Rocket",
}

export interface IOrderItem {
  productId: string;
  productObjectId: Types.ObjectId;
  productName: string;
  pricePerUnit: number;
  quantity: number;
  totalPrice: number;
  productImage?: string;
  size?: string;
  color?: string;
}

export interface IOrder extends Document {
  userId: Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  shippingAddress: {
    division: string;
    district: string;
    upazila: string;
    address: string; // village/road/house/flat
  };
  contactNumber: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentDetails?: {
    transactionId?: string;
    phoneNumber?: string;
    gateway?: string;
  };
  orderStatus: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}
