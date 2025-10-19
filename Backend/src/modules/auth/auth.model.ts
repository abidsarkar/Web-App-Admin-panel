// src/models/user/user.model.ts
import mongoose, { Schema } from "mongoose";
import { IEmployer } from "./auth.interface";

const employerInformationSchema = new Schema<IEmployer>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
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
    address: {
      type: String,
      maxLength: [200, "maximum length should be 200"],
    },
    profilePic: {
      type: String,
    },
    profilePic_src: {
      type: String,
    },
    position: {
      type: String,
    },
    employer_id: {
      type: String,
      unique: [true, "Employer id should be unique"],
    },
    role: {
      type: String,
      enum: ["subAdmin", "superAdmin", "undefined"],
      default: "undefined",
    },
    password: {
      type: String,
      required: [false, "Password is required"],
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
    lastLoginAt: {
      type: Date,
    },
   createdBy: {
    id: { type: String },
    role: { type: String },
    email: { type: String },
  },
  },
  { timestamps: true }
);

export const EmployerInfo = mongoose.model<IEmployer>(
  "EmployerInformation",
  employerInformationSchema
);
