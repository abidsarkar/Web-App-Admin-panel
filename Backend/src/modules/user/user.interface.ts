// src/types/user.interface.ts
import { Document } from "mongoose";

export type UserRole = "admin" | "superAdmin";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone?: string;
  profilePic?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  // instance methods
  comparePassword(candidatePassword: string): Promise<boolean>;
}
