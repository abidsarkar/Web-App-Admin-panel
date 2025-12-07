import mongoose, { Types } from "mongoose";
import ApiError from "../../errors/ApiError";
import { CartModel } from "../cart/cart.model";
import { ProductModel } from "../product/product.model";
import { Order } from "./order.model";
import { OrderStatus, PaymentMethod, PaymentStatus } from "./order.interface";

const placeOrder = async (
  userId: string,
  payload: {
    shippingAddress: any;
    contactNumber: string;
    paymentMethod: PaymentMethod;
    paymentDetails?: any;
  }
) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    // 1. Get User's Cart
    const cart = await CartModel.findOne({ userId }).session(session);
    if (!cart || cart.items.length === 0) {
      throw new ApiError(400, "Cart is empty");
    }

    let totalAmount = 0;
    const orderItems = [];

    // 2. Validate Items & Stock
    for (const item of cart.items) {
      const product = await ProductModel.findById(item.productObjectId).session(
        session
      );

      if (!product) {
        throw new ApiError(
          404,
          `Product not found: ${item.productName} (${item.productObjectId})`
        );
      }

      // Stock Check
      if ((product.productStock || 0) < item.quantity) {
        throw new ApiError(
          400,
          `Insufficient stock for ${item.productName}. Available: ${product.productStock}, Requested: ${item.quantity}`
        );
      }

      // Payment Option Validation (e.g. if product doesn't support COD)
      // Assuming 'productPaymentOption' can be 'ALL', 'PREPAID', 'COD'
      if (
        product.productPaymentOption &&
        product.productPaymentOption !== "ALL"
      ) {
        const requiredOption = product.productPaymentOption.toUpperCase();
        if (
          requiredOption === "PREPAID" &&
          payload.paymentMethod === PaymentMethod.COD
        ) {
          throw new ApiError(
            400,
            `Product ${item.productName} does not support Cash on Delivery`
          );
        }
        // Add more specific checks if needed
      }

      // Deduct Stock
      product.productStock = (product.productStock || 0) - item.quantity;
      await product.save({ session });

      totalAmount += item.totalPrice;
      orderItems.push(item);
    }

    // 3. Determine Payment Status
    let paymentStatus = PaymentStatus.Pending;
    if (payload.paymentMethod !== PaymentMethod.COD) {
      // For digital payments, you might default to 'Pending' until verified
      // Or if this endpoint is called AFTER payment verification on frontend,
      // you assume it's paid or verify transaction ID here.
      // Based on prompt: "input the payment number and transiciton id thn confrim thh order"
      if (payload.paymentDetails?.transactionId) {
        // In a real app, verify this TrxID with payment provider
        paymentStatus = PaymentStatus.Paid;
      }
    }

    // 4. Create Order
    const order = await Order.create(
      [
        {
          userId,
          items: orderItems,
          totalAmount,
          shippingAddress: payload.shippingAddress,
          contactNumber: payload.contactNumber,
          paymentMethod: payload.paymentMethod,
          paymentStatus: paymentStatus,
          paymentDetails: payload.paymentDetails,
          orderStatus: OrderStatus.Pending,
        },
      ],
      { session }
    );

    // 5. Clear Cart
    await CartModel.findOneAndDelete({ userId }).session(session);

    await session.commitTransaction();
    session.endSession();

    return order[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const OrderServices = {
  placeOrder,
};
