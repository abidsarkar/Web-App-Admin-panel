import  httpStatus  from 'http-status';
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import ApiError from '../../errors/ApiError';
import { sendAccessCookie } from '../auth/auth.utils';
import z from 'zod';
import { createProductSchema, productIdSchema, uploadProductCoverPictureSchema } from './product.zodSchema';
import { createProductService, uploadProductCoverPictureService } from './product.service';


export const createProductController = catchAsync(
  async (req: Request, res: Response) => {
    const parsed = createProductSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "create product Validation Error",
        errors: z.treeifyError(parsed.error),
      });
    }
    const admin_id = req.user?.id; //supper admin id form accessToken
    const admin_role = req.user?.role; //supper admin role form accessToken
    const admin_email = req.user?.email; //supper admin email form accessToken
    const { statusCode, success, message, error, data } =
      await createProductService(
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
        product: data?.product,
        user: data?.user,
      },
    });
  }
);
export const uploadProductCoverPicController = catchAsync(
  async (req: Request, res: Response) => {
    const parsed = productIdSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "upload product cover picture _id Validation Error",
        errors: z.treeifyError(parsed.error),
      });
    }
    const parsedFile = uploadProductCoverPictureSchema.safeParse(req.file);
    if (!parsedFile.success) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "upload product cover picture Validation Error",
        errors: z.treeifyError(parsedFile.error),
      });
    }
    let { ...productCoverPictureData } = req.file;
    const admin_id = req.user?.id; //supper admin id form accessToken
    const admin_role = req.user?.role; //supper admin role form accessToken
    const admin_email = req.user?.email; //supper admin email form accessToken
    const { statusCode, success, message, error, data } =
      await uploadProductCoverPictureService(
        parsed.data,
        productCoverPictureData,
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
        product: data?.product,
        user: data?.user,
      },
    });
  }
);