// src/modules/cart/cart.controller.ts
import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import httpStatus from "http-status";
import {
  addToCartSchema,
  updateCartItemSchema,
  removeFromCartSchema,
  mergeCartsSchema,
} from "./cart.zodSchema";
import z from "zod";
import sendResponse from "../../utils/sendResponse";
import {
  addToCartService,
} from "./cart.service";
import { sendAccessCookie } from "../customerAuth/customerAuth.utils";

export const addToCartController = catchAsync(
  async (req: Request, res: Response) => {
    const parsed = addToCartSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "Add to cart validation error",
        errors: z.treeifyError(parsed.error),
      });
    }

    const customerId = req.user?.id;

    const { statusCode, success, message, error, data } =
      await addToCartService(parsed.data, customerId!);
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
// export const getCartController = catchAsync(
//   async (req: Request, res: Response) => {
//     const userId = req.user?.id;

//     sendResponse(res, {
//       statusCode: httpStatus.OK,
//       success: true,
//       message: "Cart retrieved successfully",
//       error: null,
//       data: cart,
//     });
//   }
// );

// export const updateCartItemController = catchAsync(
//   async (req: Request, res: Response) => {
//     const parsed = updateCartItemSchema.safeParse(req.body);
//     if (!parsed.success) {
//       return res.status(httpStatus.BAD_REQUEST).json({
//         success: false,
//         message: "Update cart validation error",
//         errors: z.treeifyError(parsed.error),
//       });
//     }

//     const userId = req.user?.id;
//     const sessionId = req.headers["x-session-id"] as string;

//     const { statusCode, success, message, error, data } =
//       await updateCartItemService(parsed.data, userId, sessionId);

//     sendResponse(res, {
//       statusCode,
//       success,
//       message,
//       error,
//       data,
//     });
//   }
// );

// export const removeFromCartController = catchAsync(
//   async (req: Request, res: Response) => {
//     const parsed = removeFromCartSchema.safeParse(req.body);
//     if (!parsed.success) {
//       return res.status(httpStatus.BAD_REQUEST).json({
//         success: false,
//         message: "Remove from cart validation error",
//         errors: z.treeifyError(parsed.error),
//       });
//     }

//     const userId = req.user?.id;
//     const sessionId = req.headers["x-session-id"] as string;

//     const { statusCode, success, message, error, data } =
//       await removeFromCartService(parsed.data, userId, sessionId);

//     sendResponse(res, {
//       statusCode,
//       success,
//       message,
//       error,
//       data,
//     });
//   }
// );

// export const clearCartController = catchAsync(
//   async (req: Request, res: Response) => {
//     const userId = req.user?.id;
//     const sessionId = req.headers["x-session-id"] as string;

//     const { statusCode, success, message, error, data } =
//       await clearCartService(userId, sessionId);

//     sendResponse(res, {
//       statusCode,
//       success,
//       message,
//       error,
//       data,
//     });
//   }
// );

// export const mergeCartsController = catchAsync(
//   async (req: Request, res: Response) => {
//     const parsed = mergeCartsSchema.safeParse(req.body);
//     if (!parsed.success) {
//       return res.status(httpStatus.BAD_REQUEST).json({
//         success: false,
//         message: "Merge carts validation error",
//         errors: z.treeifyError(parsed.error),
//       });
//     }

//     const userId = req.user!.id;

//     const { statusCode, success, message, error, data } =
//       await mergeCartsService(parsed.data, userId);

//     sendResponse(res, {
//       statusCode,
//       success,
//       message,
//       error,
//       data,
//     });
//   }
// );

// export const validateCartController = catchAsync(
//   async (req: Request, res: Response) => {
//     const userId = req.user!.id;

//     const { statusCode, success, message, error, data } =
//       await validateCartService(userId);

//     sendResponse(res, {
//       statusCode,
//       success,
//       message,
//       error,
//       data,
//     });
//   }
// );
