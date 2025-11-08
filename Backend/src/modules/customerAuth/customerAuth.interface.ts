// src/types/user.interface.ts
import { Document, Types } from "mongoose";

export type customerRole = "customer" | "undefined";
export interface IAddress extends Document {
  division?: string;
  district?: string;
  upazila?: string;
  village_road_house_flat: string;
}
export interface ICustomer extends Document {
  _id: Types.ObjectId;
  firstName: string;
  lastName?: string;
  email: string;
  phone: string;
  secondaryPhoneNumber?: string;
  address?: IAddress;
  profilePicture?: {
    _id: Types.ObjectId;
    filePathURL: string;
    fileOriginalName: string;
    fileServerName: string;
    size: number;
    mimetype: string;
  };
  role: customerRole;
  password: string;
  otp?: string;
  otpExpiresAt?: Date;
  changePasswordExpiresAt?: Date;
  isForgotPasswordVerified?: boolean;
  isActive: boolean;
  lastLogin: Date;
  isDeleted:boolean;
  deletedAt?:Date;
  createdAt: Date;
  updatedAt: Date;
}
