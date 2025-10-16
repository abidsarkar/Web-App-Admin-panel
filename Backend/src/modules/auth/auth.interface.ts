// src/types/user.interface.ts
import { Document } from "mongoose";

export type AdminRole = "admin" | "superAdmin";

export interface IAdmin extends Document {
  name: string;
  email: string;
  password: string;
  phone?: string;
  profilePic?: string;
  role: AdminRole;
  otp?:string;
  otpExpiresAt?:Date;
  changePasswordExpiresAt?:Date;
  isForgotPasswordVerified?:boolean;
  isActive: boolean;
  lastLoginAt:Date,
  createdAt: Date;
  updatedAt: Date;

  // instance methods
  comparePassword(candidatePassword: string): Promise<boolean>;
}
