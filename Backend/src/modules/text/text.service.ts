import ExcelJs from "exceljs";
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
import { cacheKeys,CACHE_EXPIRATION, cacheService } from '../../redis/redisUtils';

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

  const text = await TextModel.findOneAndUpdate(
    {},
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
      new: true,
      upsert: true,
      runValidators: true,
    }
  );

  const safeUser = text.toObject();

  // Clear all text-related cache when data is updated
  await cacheService.deleteByPattern('text:*');
  console.log('🗑️ Cleared text cache after update');

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
  // Generate cache key based on fields
  const cacheKey = fields?.length 
    ? cacheKeys.text.fields(fields)
    : cacheKeys.text.full();

  // Try to get from cache first
  const cachedText = await cacheService.get(cacheKey);
  if (cachedText) {
    //console.log('📦 Serving text from cache');
    return {
      statusCode: httpStatus.OK,
      success: true,
      message: fields?.length
        ? `Fetched selected fields from cache: ${fields.join(", ")}`
        : "Fetched full text document from cache",
      error: null,
      data: cachedText,
    };
  }

  // If not in cache, fetch from database
  const projection = fields?.length
    ? fields.reduce((acc, field) => {
        acc[field] = 1;
        return acc;
      }, {} as Record<string, 1>)
    : {};

  const text = await TextModel.findOne({}, projection).lean();

  if (!text) {
    throw new ApiError(httpStatus.NOT_FOUND, "No text document found");
  }

  // Store in cache for future requests
  await cacheService.set(cacheKey, text, CACHE_EXPIRATION.TEXT_DATA);

  return {
    statusCode: httpStatus.OK,
    success: true,
    message: fields?.length
      ? `Fetched selected fields: ${fields.join(", ")}`
      : "Fetched full text document",
    error: null,
    data: text,
  };
};
export const getAllTextService = async (admin_id: string) => {
  const cacheKey = cacheKeys.text.all();

  // Try cache first
  const cachedText = await cacheService.get(cacheKey);
  if (cachedText) {
    //console.log('📦 Serving all text from cache');
    return {
      statusCode: httpStatus.OK,
      success: true,
      message: "Fetched all text document from cache",
      error: null,
      data: cachedText,
    };
  }

  const text = await TextModel.find().lean();

  if (!text || text.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "No text document found");
  }

  // Store in cache
  await cacheService.set(cacheKey, text, CACHE_EXPIRATION.TEXT_DATA);

  return {
    statusCode: httpStatus.OK,
    success: true,
    message: "Fetched all text document",
    error: null,
    data: text,
  };
};
export const exportAllTextContentService = async (
  admin_id: string,
  admin_role: string,
  admin_email: string
) => {
  // Fetch all text content
  const textContents = await TextModel.find().lean();

  if (!textContents.length) {
    throw new ApiError(httpStatus.NOT_FOUND, "No text content found");
  }

  // Create workbook and worksheet
  const workbook = new ExcelJs.Workbook();
  const worksheet = workbook.addWorksheet("Text Content");

  // Define columns with appropriate widths for text content
  worksheet.columns = [
    { header: "_id", key: "_id", width: 25 },
    { header: "About Us", key: "aboutUs", width: 40 },
    { header: "Achievements", key: "achievements", width: 40 },
    { header: "Office Hours", key: "officeHours", width: 20 },
    { header: "Map", key: "map", width: 40 },
    { header: "Address", key: "address", width: 30 },
    { header: "Contact Phone", key: "contactPhone", width: 20 },
    { header: "Contact Email", key: "contactEmail", width: 25 },
    { header: "Facebook Link", key: "facebookLink", width: 30 },
    { header: "YouTube Link", key: "youtubeLink", width: 30 },
    { header: "Instagram Link", key: "instagramLink", width: 30 },
    { header: "X (Twitter) Link", key: "xLink", width: 30 },
    { header: "GitHub Link", key: "githubLink", width: 30 },
    { header: "LinkedIn Link", key: "linkedinLink", width: 30 },
    { header: "TikTok Link", key: "tiktokLink", width: 30 },
    { header: "Terms of Service", key: "termsOfService", width: 40 },
    { header: "Privacy Policy", key: "privacyPolicy", width: 40 },
    { header: "Shipping Policy", key: "shippingPolicy", width: 40 },
    { header: "Return Policy", key: "returnPolicy", width: 40 },
    { header: "Refund Policy", key: "refundPolicy", width: 40 },
    { header: "Cookie Policy", key: "cookiePolicy", width: 40 },
    { header: "Shipping Restriction", key: "shippingRestriction", width: 30 },
    { header: "Disclaimer", key: "disclaimer", width: 40 },
    { header: "Last Updated By ID", key: "lastUpdatedBy_id", width: 25 },
    { header: "Last Updated By Role", key: "lastUpdatedBy_role", width: 20 },
    { header: "Last Updated By Email", key: "lastUpdatedBy_email", width: 25 },
    { header: "Last Updated At", key: "lastUpdatedBy_updatedAt", width: 20 },
    { header: "Created Date", key: "createdAt", width: 20 },
    { header: "Updated Date", key: "updatedAt", width: 20 },
  ];

  // Add data rows
  textContents.forEach((text) => {
    worksheet.addRow({
      _id: text._id?.toString() || "N/A",
      aboutUs: text.aboutUs || "N/A",
      achievements: text.achievements || "N/A",
      officeHours: text.officeHours || "N/A",
      map: text.map || "N/A",
      address: text.address || "N/A",
      contactPhone: text.contactPhone || "N/A",
      contactEmail: text.contactEmail || "N/A",
      facebookLink: text.facebookLink || "N/A",
      youtubeLink: text.youtubeLink || "N/A",
      instagramLink: text.instagramLink || "N/A",
      xLink: text.xLink || "N/A",
      githubLink: text.githubLink || "N/A",
      linkedinLink: text.linkedinLink || "N/A",
      tiktokLink: text.tiktokLink || "N/A",
      termsOfService: text.termsOfService || "N/A",
      privacyPolicy: text.privacyPolicy || "N/A",
      shippingPolicy: text.shippingPolicy || "N/A",
      returnPolicy: text.returnPolicy || "N/A",
      refundPolicy: text.refundPolicy || "N/A",
      cookiePolicy: text.cookiePolicy || "N/A",
      shippingRestriction: text.shippingRestriction || "N/A",
      disclaimer: text.disclaimer || "N/A",
      lastUpdatedBy_id: text.lastUpdatedBy?.id || "N/A",
      lastUpdatedBy_role: text.lastUpdatedBy?.role || "N/A",
      lastUpdatedBy_email: text.lastUpdatedBy?.email || "N/A",
      lastUpdatedBy_updatedAt: text.lastUpdatedBy?.updatedAt
        ? new Date(text.lastUpdatedBy.updatedAt).toLocaleString()
        : "N/A",
      createdAt: text.createdAt
        ? new Date(text.createdAt).toLocaleString()
        : "N/A",
      updatedAt: text.updatedAt
        ? new Date(text.updatedAt).toLocaleString()
        : "N/A",
    });
  });

  // Style header row
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFFF2E6" }, // Light orange background
  };

  // Wrap text for better readability of long content
  worksheet.columns.forEach(column => {
    if (column.key && column.key !== '_id' && column.key !== 'createdAt' && column.key !== 'updatedAt') {
      worksheet.getColumn(column.key).alignment = { wrapText: true, vertical: 'top' };
    }
  });

  // Auto-fit columns for better readability
  worksheet.columns.forEach(column => {
    if (column.width) {
      column.width = Math.max(column.width, 15);
    }
  });

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  const accessToken = generateAccessToken({
    id: admin_id,
    role: admin_role,
    email: admin_email,
  });

  return {
    statusCode: httpStatus.OK,
    success: true,
    message: "Text content exported successfully",
    error: null,
    data: {
      accessToken,
      buffer: Buffer.from(buffer),
      fileName: `text_content_export_${Date.now()}.xlsx`,
      count: textContents.length,
      user: {
        id: admin_id,
        role: admin_role,
        email: admin_email,
      },
    },
  };
};