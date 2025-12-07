import { Schema, model } from "mongoose";
import {
  IOrder,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from "./order.interface";

const OrderSchema = new Schema<IOrder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    items: [
      {
        productId: { type: String, required: true },
        productObjectId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        productName: { type: String, required: true },
        pricePerUnit: { type: Number, required: true },
        quantity: { type: Number, required: true },
        totalPrice: { type: Number, required: true },
        productImage: { type: String },
        size: { type: String },
        color: { type: String },
      },
    ],
    totalAmount: { type: Number, required: true },
    shippingAddress: {
      division: { type: String, required: true },
      district: { type: String, required: true },
      upazila: { type: String, required: true },
      address: { type: String, required: true },
    },
    contactNumber: { type: String, required: true },
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod),
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.Pending,
    },
    paymentDetails: {
      transactionId: { type: String },
      phoneNumber: { type: String },
      gateway: { type: String },
    },
    orderStatus: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Pending,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Order = model<IOrder>("Order", OrderSchema);
