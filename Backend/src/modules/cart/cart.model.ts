// src/models/cart/cart.model.ts
import { Schema, model } from "mongoose";
import { ICart } from "./cart.interface";

const cartItemSchema = new Schema(
  {
    productId: { type: String, required: true },
    productObjectId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productName: { type: String, required: true },
    pricePerUnit: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    totalPrice: { type: Number, required: true },
    productImage: { type: String },
    size: { type: String },
    color: { type: String },
  },
  { _id: false, versionKey: false }
);

const cartSchema = new Schema<ICart>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      sparse: true, // Allows null for guest users
    },
    
    items: [cartItemSchema],
    
  },
  { timestamps: true, versionKey: false }
);

// Compound index to ensure one cart per user
cartSchema.index({ userId: 1 }, { unique: true, sparse: true });



export const CartModel = model<ICart>("Cart", cartSchema);
