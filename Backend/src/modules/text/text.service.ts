import argon2 from "argon2";
import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../utils/JwtToken";
import { TextModel } from "./text.model";
import { createTextSchema } from "./text.zodSchema";
import z from "zod";
import { EmployerInfo } from "../auth/auth.model";
import { error } from "console";

export const createOrUpdateTextService = async (
  data: z.infer<typeof createTextSchema>,
  admin_id: string,
  admin_role: string,
  admin_email: string
) => {
  
  const existingUser = await EmployerInfo.findById(admin_id);
  if (!existingUser) {
    throw new ApiError(httpStatus.CONFLICT, "Use a valid super admin id");
  }

   // Use findOneAndUpdate with upsert
  const text = await TextModel.findOneAndUpdate(
    {}, // empty filter - works if you only have one document
    {
      ...data,
      $setOnInsert: {
        createdBy: {
          id: admin_id,
          role: admin_role,
          email: admin_email,
          createdAt: new Date(),
        },
      },
      lastUpdatedBy: {
        id: admin_id,
        role: admin_role,
        email: admin_email,
        updatedAt: new Date(),
      },
    },
    {
      new: true, // return updated document
      upsert: true, // create if doesn't exist
      runValidators: true,
    }
  );

  const safeUser = text.toObject();

  const accessToken = generateAccessToken({
    id: admin_id,
    role: admin_role,
    email: admin_email,
  });

  return {
    statusCode: httpStatus.CREATED,
    success: true,
    message: `Text ${text.createdAt === text.updatedAt ? 'Created' : 'Updated'} Successfully`,
    error: null,
    data: {
      accessToken,
      text: safeUser,
      user: {
        id: admin_id,
        role: admin_role,
        email: admin_email,
      },
    },
  };
};
export const getTextService = async (fields?: string[]) => {
  // If no fields are specified, fetch all
  const projection = fields?.length
    ? fields.reduce((acc, field) => {
        acc[field] = 1; // 1 = include this field
        return acc;
      }, {} as Record<string, 1>)
    : {};

  const text = await TextModel.findOne({}, projection).lean();

  if (!text) {
    throw new ApiError(httpStatus.NOT_FOUND, "No text document found");
  }

  return {
    statusCode: httpStatus.OK,
    success: true,
    message: fields?.length
      ? `Fetched selected fields: ${fields.join(", ")}`
      : "Fetched full text document",
    error:null,
    data: text,
  };
};
export const getAllTextService = async (admin_id: string) => {
  
  const text = await TextModel.find().lean();

  if (!text) {
    throw new ApiError(httpStatus.NOT_FOUND, "No text document found");
  }

  return {
    statusCode: httpStatus.OK,
    success: true,
    message: "Fetched all text document",
    error:null,
    data: text,
  };
};