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
  getAllProductsAdminSchema,
  getAllProductsSchema,
  getSubCategoryProductSchema,
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
  exportAllProductsToExcelService,
  getAllProductsAdminService,
  getAllProductsService,
  getSingleProductsAdminService,
  getSingleProductsService,
  getSubCategoryProductsService,
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
        message: "All product Validation Error",
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
        pagination: data?.pagination,
        product: data?.products,
      },
    });
  }
);
//get single product public
export const getSingleProductController = catchAsync(
  async (req: Request, res: Response) => {
    const parsed = productIdSchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "single product Validation Error",
        errors: z.treeifyError(parsed.error),
      });
    }
    const admin_id = req.user?.id; //supper admin id form accessToken
    const admin_role = req.user?.role; //supper admin role form accessToken
    const admin_email = req.user?.email; //supper admin email form accessToken
    const { statusCode, success, message, error, data } =
      await getSingleProductsService(parsed.data);

    sendResponse(res, {
      statusCode,
      success,
      message,
      error,
      data: {
        product: data?.product,
      },
    });
  }
);
//get single product admin
export const getSingleProductAdminController = catchAsync(
  async (req: Request, res: Response) => {
    const parsed = productIdSchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "single product admin Validation Error",
        errors: z.treeifyError(parsed.error),
      });
    }
    const admin_id = req.user?.id; //supper admin id form accessToken
    const admin_role = req.user?.role; //supper admin role form accessToken
    const admin_email = req.user?.email; //supper admin email form accessToken
    const { statusCode, success, message, error, data } =
      await getSingleProductsAdminService(
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
//get all product info for admin
export const allProductAdminController = catchAsync(
  async (req: Request, res: Response) => {
    const parsed = getAllProductsAdminSchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "all product Admin Validation Error",
        errors: z.treeifyError(parsed.error),
      });
    }
    const admin_id = req.user?.id; //supper admin id form accessToken
    const admin_role = req.user?.role; //supper admin role form accessToken
    const admin_email = req.user?.email; //supper admin email form accessToken
    const { statusCode, success, message, error, data } =
      await getAllProductsAdminService(
        parsed.data,
        admin_id!,
        admin_role!,
        admin_email!
      );

    sendResponse(res, {
      statusCode,
      success,
      message,
      error,
      data: {
        pagination: data?.pagination,
        product: data?.products,
        user: data?.user,
      },
    });
  }
);
//get product according to sub category
export const getSubCategoryProductController = catchAsync(
  async (req: Request, res: Response) => {
    const parsed = getSubCategoryProductSchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "Get sub category product Validation Error",
        errors: z.treeifyError(parsed.error),
      });
    }
    const admin_id = req.user?.id; //supper admin id form accessToken
    const admin_role = req.user?.role; //supper admin role form accessToken
    const admin_email = req.user?.email; //supper admin email form accessToken
    const { statusCode, success, message, error, data } =
      await getSubCategoryProductsService(parsed.data);

    sendResponse(res, {
      statusCode,
      success,
      message,
      error,
      data: {
        pagination: data?.pagination,
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
    const admin_id = req.user?.id;
    const admin_role = req.user?.role;
    const admin_email = req.user?.email;
    const { statusCode, success, message, error, data } =
      await replaceProductImageService(
        parsed.data,
        req.file,
        admin_id!,
        admin_role!,
        admin_email!
      );

    sendAccessCookie(res, data?.accessToken);
    sendResponse(res, { statusCode, success, message, error, data });
  }
);
//export all product to excel
// export const exportAllProductsController = catchAsync(
//   async (req: Request, res: Response) => {
//     const { statusCode, success, message, error, data } =
//       await exportAllProductsToExcelService(
//         req.user!.id,
//         req.user!.role,
//         req.user!.email
//       );

//     sendAccessCookie(res, data?.accessToken);
//     // Set headers for file download
//     res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//     res.setHeader('Content-Disposition', `attachment; filename=${result.data.fileName}`);
//     res.setHeader('Content-Length', data.buffer.length);

//     // Send the file
//     res.send(result.data.buffer);
//     sendResponse(res, {
//       statusCode,
//       success,
//       message,
//       error,
//       data: {
//         accessToken: data?.accessToken,
//         user: data?.user,
//       },
//     });
//   }
// );
//! download only
//export all product to excel
export const exportAllProductsController = catchAsync(
  async (req: Request, res: Response) => {
    const { statusCode, success, message, error, data } =
      await exportAllProductsToExcelService(
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