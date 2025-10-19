// src/types/user.interface.ts
import { Document, Types } from "mongoose";

export type AdminRole = "subAdmin" | "superAdmin" | "undefined";

export interface IEmployer extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  secondaryPhoneNumber?: string;
  address?: string;
  profilePic?: string;
  profilePic_src?: string;
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
  };
  createdAt: Date;
  updatedAt: Date;

  // instance methods
  comparePassword(candidatePassword: string): Promise<boolean>;
}
