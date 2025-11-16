//src/modules/tet/text.controller.ts
import httpStatus from "http-status";
import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import ApiError from "../../errors/ApiError";
import { sendAccessCookie, sendRefreshCookie } from "../auth/auth.utils";
import z from "zod";
import { createTextSchema } from "./text.zodSchema";
import { createOrUpdateTextService, exportAllTextContentService, getAllTextService, getTextService } from "./text.service";

export const createOrUpdateTextController = catchAsync(
  async (req: Request, res: Response) => {
    const parsed = createTextSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "create text Validation Error",
        errors: z.treeifyError(parsed.error),
      });
    }

    const admin_id = req.user?.id;
    const admin_role = req.user?.role;
    const admin_email = req.user?.email;
    const { statusCode, success, message, error, data } =
      await createOrUpdateTextService(
        parsed.data,
        admin_id!,
        admin_role!,
        admin_email!
      );
    sendAccessCookie(res, data?.accessToken);
    sendResponse(res, {
      statusCode,
      success,
      message,
      error,
      data: {
        accessToken: data?.accessToken,
        text: data?.text,
        user: data?.user,
      },
    });
  }
);
export const getTextController = catchAsync(
  async (req: Request, res: Response) => {
    const { fields } = req.query;

    // Parse "fields" query param → string[] (e.g., "aboutUs,address")
    const fieldArray =
      typeof fields === "string"
        ? fields
            .split(",")
            .map((f) => f.trim())
            .filter(Boolean)
        : [];

    const { statusCode, success, message, error, data } =
      await getTextService(fieldArray);

    sendResponse(res, {
      statusCode,
      success,
      message,
      error,
      data,
    });
  }
);
//get all text info controller
export const getAllTextController = catchAsync(
  async (req: Request, res: Response) => {
    const admin_id = req.user?.id;
    const admin_role = req.user?.role;
    const admin_email = req.user?.email;

    const { statusCode, success, message, error, data } =
      await getAllTextService(admin_id!);

    sendResponse(res, {
      statusCode,
      success,
      message,
      error,
      data,
    });
  }
);
export const exportAllTextContentController = catchAsync(
  async (req: Request, res: Response) => {
    const { statusCode, success, message, error, data } =
      await exportAllTextContentService(
        req.user!.id,
        req.user!.role,
        req.user!.email
      );

    // If there's an error, send normal JSON response
    if (!success || error) {
      sendAccessCookie(res, data?.accessToken);
      return sendResponse(res, {
        statusCode,
        success,
        message,
        error,
        data: {
          accessToken: data?.accessToken,
          user: data?.user,
        },
      });
    }

    // Ensure buffer is properly typed
    const fileBuffer = Buffer.isBuffer(data.buffer) ? data.buffer : Buffer.from(data.buffer);

    // Set headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${data.fileName}`);
    res.setHeader('Content-Length', fileBuffer.length);

    // Send access token in cookie
    sendAccessCookie(res, data.accessToken);

    // Send the file buffer - this ends the response
    res.send(fileBuffer);
  }
);