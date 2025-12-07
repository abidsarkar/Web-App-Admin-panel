import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { OrderServices } from "./order.service";
import httpStatus from "http-status";

const placeOrder = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id; // User ID from auth middleware
  if (!userId) {
    throw new Error("User not found in request");
  }
  const result = await OrderServices.placeOrder(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order placed successfully",
    data: result,
  });
});

export const OrderControllers = {
  placeOrder,
};
