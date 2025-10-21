import  httpStatus  from 'http-status';
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import ApiError from '../../errors/ApiError';
import { sendAccessCookie, sendRefreshCookie } from '../auth/auth.utils';
import z from 'zod';
import { createTextSchema } from './text.zodSchema';
import { createOrUpdateTextService, getTextService } from './text.service';


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

    const admin_id = req.user?.id; //supper admin id form accessToken
    const admin_role = req.user?.role; //supper admin role form accessToken
    const admin_email = req.user?.email; //supper admin email form accessToken
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
export const getTextController = catchAsync(async (req: Request, res: Response) => {
  const { fields } = req.query;

  // Parse "fields" query param → string[] (e.g., "aboutUs,address")
  const fieldArray =
    typeof fields === "string"
      ? fields.split(",").map((f) => f.trim()).filter(Boolean)
      : [];

  const { statusCode, success, message,error, data } = await getTextService(fieldArray);

  sendResponse(res, {
    statusCode,
    success,
    message,
    error,
    data,
  });
});