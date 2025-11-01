// src/models/user/user.model.ts
import mongoose, { Schema } from "mongoose";
import { ICustomer } from "./customerAuth.interface";
// 🏠 Address Schema
const addressSchema = new Schema(
  {
    division: { type: String },
    district: { type: String },
    upazila: { type: String },
    village_road_house_flat: { type: String, required: true },
  },
  { _id: false }
);
const customerInformationSchema = new Schema<ICustomer>(
  {
    firstName: {
      type: String,
      required: [true, "First Name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "phone number is required"],
      maxLength: [16, "maximum length should be 16"],
    },
    secondaryPhoneNumber: {
      type: String,
      maxLength: [16, "maximum length should be 16"],
    },
    address: addressSchema,
    profilePicture: {
      _id: { type: mongoose.Schema.Types.ObjectId },
      filePathURL: {
        type: String,
        default: "/public/uploads/profile_pictures/defaultProfilePicture.png",
      },
      fileOriginalName: {
        type: String,
        default: "defaultProfilePictureAADD.png",
        required: false,
      },
      fileServerName: {
        type: String,
        default: "1745471655982-763482898.png",
        required: false,
      },
      size: { type: Number },
      mimetype: { type: String },
    },
    role: {
      type: String,
      enum: ["customer", "undefined"],
      default: "customer",
    },
    
    password: {
      type: String,
      required: [true, "Password is required"],
      minLength: [6, "Password must be at least 6 characters long"],
      select: false, // hide password by default
    },

    otp: {
      type: String,
    },
    otpExpiresAt: {
      type: Date,
    },
    changePasswordExpiresAt: {
      type: Date,
    },
    isForgotPasswordVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin:{
      type:Date,
      
    }
    
  },
  { timestamps: true, versionKey: false }
);

export const customerInfoModel = mongoose.model<ICustomer>(
  "Customer",
  customerInformationSchema
);
