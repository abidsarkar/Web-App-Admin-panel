import httpStatus from "http-status";
import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import ApiError from "../../errors/ApiError";
import { sendAccessCookie } from "../auth/auth.utils";
import z from "zod";
import {
  createProductSchema,
  deleteProductImageSchema,
  deleteProductSchema,
  getAllProductsSchema,
  productIdSchema,
  replaceProductImageSchema,
  updateProductSchema,
  uploadManyProductPicSchema,
  uploadProductCoverPictureSchema,
} from "./product.zodSchema";
import {
  createProductService,
  deleteProductImageService,
  deleteProductService,
  getAllProductsService,
  replaceProductImageService,
  updateProductService,
  uploadProductCoverPictureService,
  uploadProductManyPicService,
} from "./product.service";

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
//update product
export const updateProductController = catchAsync(
  async (req: Request, res: Response) => {
    const parsed = updateProductSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "update product Validation Error",
        errors: z.treeifyError(parsed.error),
      });
    }
    const admin_id = req.user?.id; //supper admin id form accessToken
    const admin_role = req.user?.role; //supper admin role form accessToken
    const admin_email = req.user?.email; //supper admin email form accessToken
    const { statusCode, success, message, error, data } =
      await updateProductService(
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
//get all product
export const allProductController = catchAsync(
  async (req: Request, res: Response) => {
    const parsed = getAllProductsSchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "update product Validation Error",
        errors: z.treeifyError(parsed.error),
      });
    }
    const admin_id = req.user?.id; //supper admin id form accessToken
    const admin_role = req.user?.role; //supper admin role form accessToken
    const admin_email = req.user?.email; //supper admin email form accessToken
    const { statusCode, success, message, error, data } =
      await getAllProductsService(parsed.data);

    sendResponse(res, {
      statusCode,
      success,
      message,
      error,
      data: {
        pagination:data?.pagination,
        product: data?.products,
      },
    });
  }
);
//delete product with image
export const deleteProductController = catchAsync(
  async (req: Request, res: Response) => {
    const parsed = deleteProductSchema.safeParse(req.query);

    if (!parsed.success) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "Product delete validation error",
        errors: z.treeifyError(parsed.error),
      });
    }

    const admin_id = req.user?.id!;
    const admin_role = req.user?.role!;
    const admin_email = req.user?.email!;

    const { statusCode, success, message, error, data } =
      await deleteProductService(
        parsed.data,
        admin_id,
        admin_role,
        admin_email
      );

    sendAccessCookie(res, data?.accessToken);
    sendResponse(res, {
      statusCode,
      success,
      message,
      error,
      data,
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
//upload many image
export const uploadProductManyPicController = catchAsync(
  async (req: Request, res: Response) => {
    const parsed = productIdSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "Product _id validation error",
        errors: z.treeifyError(parsed.error),
      });
    }

    const parsedFiles = uploadManyProductPicSchema.safeParse(req.files);
    if (!parsedFiles.success) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "Product images validation error",
        errors: z.treeifyError(parsedFiles.error),
      });
    }

    const admin_id = req.user?.id;
    const admin_role = req.user?.role;
    const admin_email = req.user?.email;

    const { statusCode, success, message, error, data } =
      await uploadProductManyPicService(
        parsed.data,
        parsedFiles.data,
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
      data,
    });
  }
);
//delete image
export const deleteProductImageController = catchAsync(
  async (req: Request, res: Response) => {
    const parsed = deleteProductImageSchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "Validation error",
        errors: z.treeifyError(parsed.error),
      });
    }

    const { statusCode, success, message, error, data } =
      await deleteProductImageService(
        parsed.data,
        req.user!.id,
        req.user!.role,
        req.user!.email
      );

    sendAccessCookie(res, data?.accessToken);
    sendResponse(res, { statusCode, success, message, error, data });
  }
);
export const replaceProductImageController = catchAsync(
  async (req: Request, res: Response) => {
    const parsed = replaceProductImageSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "Validation error",
        errors: z.treeifyError(parsed.error),
      });
    }

    if (!req.file) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "No replacement image provided",
      });
    }

    const { statusCode, success, message, error, data } =
      await replaceProductImageService(
        parsed.data,
        req.file,
        req.user!.id,
        req.user!.role,
        req.user!.email
      );

    sendAccessCookie(res, data?.accessToken);
    sendResponse(res, { statusCode, success, message, error, data });
  }
);
