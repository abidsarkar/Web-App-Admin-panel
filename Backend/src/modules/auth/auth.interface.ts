// src/types/user.interface.ts
import { Document, Types } from "mongoose";

export type AdminRole = "subAdmin" | "superAdmin" |"editor"| "undefined";

export interface IEmployer extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  secondaryPhoneNumber?: string;
  address?: string;
  profilePicture?: {
    filePathURL: string;
    fileOriginalName: string;
    fileServerName: string;
    pathA: string;
  };
  position?: string;
  employer_id?: string;
  role: AdminRole;
  password: string;
  otp?: string;
  otpExpiresAt?: Date;
  changePasswordExpiresAt?: Date;
  isForgotPasswordVerified?: boolean;
  isActive: boolean;
  lastLoginAt: Date;
  createdBy?: {
    id: string;
    role: string;
    email: string;
    updatedBy:string;
    updatedAt:Date;
  };
  refreshToken:string;
  createdAt: Date;
  updatedAt: Date;

  // instance methods
  comparePassword(candidatePassword: string): Promise<boolean>;
}
