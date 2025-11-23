// src/modules/cart/cart.service.ts
import { Types } from "mongoose";
import { CartModel } from "./cart.model";
import { ProductModel } from "../product/product.model";
import { customerInfoModel } from "../customerAuth/customerAuth.model";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import {
  addToCartSchema,
  updateCartItemSchema,
  removeFromCartSchema,
  mergeCartsSchema,
  itemSchema,
} from "./cart.zodSchema";
import { z } from "zod";
import { ICartItem } from "./cart.interface";

export const addToCartService = async (
  data: z.infer<typeof addToCartSchema>,
  customerId: string
) => {
  const { userId, items } = data;

  // -----------------------------------------
  // 1. Validate user identity
  // -----------------------------------------
  if (customerId !== userId) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized cart access");
  }

  // Check valid user
  const existingUser = await customerInfoModel
    .findById(customerId)
    .select("-password");

  if (!existingUser || existingUser.isDeleted) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
  }

  if (existingUser.isActive === false) {
    throw new ApiError(httpStatus.FORBIDDEN, "User account deactivated!");
  }

  // -----------------------------------------
  // 2. Extract first item (you can loop later)
  // -----------------------------------------
  const item = items[0];
  const { productObjectId, productId, size, color, quantity } = item;

  // -----------------------------------------
  // 3. Validate Product Information
  // -----------------------------------------
  const product = await ProductModel.findOne({
    _id: productObjectId,
    productId: productId,
    isDisplayable: true,
    isSaleable: true,
  }).select(
    "productId productName productPrice productStock productSize productColor productColorCode productCoverImage"
  );

  if (!product) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Product not found or not available"
    );
  }

  // -----------------------------------------
  // 4. PRICE VALIDATION — Important
  // -----------------------------------------
  if (product.productPrice == null || product.productPrice <= 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "This product has no price. You cannot add it to your cart right now."
    );
  }

  // -----------------------------------------
  // 5. Fetch or Create Cart
  // -----------------------------------------
  let cart = await CartModel.findOne({ userId });

  if (!cart) {
    cart = new CartModel({
      userId,
      items: [],
    });
  }

  // -----------------------------------------
  // 6. Check if item already exists in cart
  // -----------------------------------------
  const existingItemIndex = cart.items.findIndex(
    (i) => i.productId === productId 
  );

  // -----------------------------------------
  // 7. If item exists → update quantity
  // -----------------------------------------
  if (existingItemIndex > -1) {
    const newQuantity =
      cart.items[existingItemIndex].quantity + quantity;

    // Stock validation
    if (product.productStock && product.productStock < newQuantity) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Insufficient stock for requested quantity"
      );
    }

    cart.items[existingItemIndex].quantity = newQuantity;
    cart.items[existingItemIndex].totalPrice =
      product.productPrice * newQuantity;
  }

  // -----------------------------------------
  // 8. If NEW item → push into cart
  // -----------------------------------------
  else {
    if ((product.productStock)&&product.productStock < quantity) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Insufficient stock for requested quantity"
      );
    }

    cart.items.push({
      ...items,
      totalPrice: product.productPrice * quantity,
     
    });
  }

  // -----------------------------------------
  // 9. Save cart
  // -----------------------------------------
  const updatedCart = await cart.save();

  // -----------------------------------------
  // 10. Response
  // -----------------------------------------
  return {
    statusCode: httpStatus.OK,
    success: true,
    message: "Item added to cart successfully",
    error: null,
    data: updatedCart,
  };
};

export const getCartService = async (userId?: string) => {
  let cart;

  if (userId) {
    // Verify user exists and is active
    const user = await customerInfoModel.findOne({
      _id: new Types.ObjectId(userId),
      isActive: true,
      isDeleted: false,
    });

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found or inactive");
    }

    cart = await CartModel.findOne({ userId: new Types.ObjectId(userId) });
  } else if (sessionId) {
    cart = await CartModel.findOne({ sessionId });
  }

  if (!cart) {
    cart = await createCartService(userId, sessionId);
  }

  // Update cart with current product info
  return await refreshCartPricesService(cart);
};

const createCartService = async (userId?: string, sessionId?: string) => {
  const cartData: any = { items: [], cartTotal: 0, totalItems: 0 };

  if (userId) {
    cartData.userId = new Types.ObjectId(userId);
  } else if (sessionId) {
    cartData.sessionId = sessionId;
  }

  return await CartModel.create(cartData);
};

export const updateCartItemService = async (
  data: z.infer<typeof updateCartItemSchema>,
  userId?: string,
  sessionId?: string
) => {
  const { productId, quantity, size, color } = data;

  if (quantity < 1) {
    return await removeFromCartService(
      { productId, size, color },
      userId,
      sessionId
    );
  }

  const cart = await getCartService(userId, sessionId);
  const itemIndex = cart.items.findIndex(
    (
      item: ICartItem // FIXED: Added ICartItem type
    ) =>
      item.productId === productId && item.size === size && item.color === color
  );

  if (itemIndex === -1) {
    throw new ApiError(httpStatus.NOT_FOUND, "Item not found in cart");
  }

  // Verify stock
  const product = await ProductModel.findOne({ productId }).select(
    "productPrice productStock isDisplayable isSaleable"
  );

  if (!product || !product.productStock || product.productStock < quantity) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Insufficient stock");
  }

  if (!product.isDisplayable || !product.isSaleable) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Product is not available for sale"
    );
  }

  cart.items[itemIndex].quantity = quantity;
  cart.items[itemIndex].totalPrice =
    cart.items[itemIndex].pricePerUnit * quantity;

  const updatedCart = await calculateCartTotalsService(cart);

  return {
    statusCode: httpStatus.OK,
    success: true,
    message: "Cart updated successfully",
    error: null,
    data: updatedCart,
  };
};

export const removeFromCartService = async (
  data: z.infer<typeof removeFromCartSchema>,
  userId?: string,
  sessionId?: string
) => {
  const { productId, size, color } = data;

  const cart = await getCartService(userId, sessionId);

  cart.items = cart.items.filter(
    (
      item: ICartItem // FIXED: Added ICartItem type
    ) =>
      !(
        item.productId === productId &&
        item.size === size &&
        item.color === color
      )
  );

  const updatedCart = await calculateCartTotalsService(cart);

  return {
    statusCode: httpStatus.OK,
    success: true,
    message: "Item removed from cart successfully",
    error: null,
    data: updatedCart,
  };
};

export const clearCartService = async (userId?: string, sessionId?: string) => {
  const cart = await getCartService(userId, sessionId);
  cart.items = [];
  const updatedCart = await calculateCartTotalsService(cart);

  return {
    statusCode: httpStatus.OK,
    success: true,
    message: "Cart cleared successfully",
    error: null,
    data: updatedCart,
  };
};

export const mergeCartsService = async (
  data: z.infer<typeof mergeCartsSchema>,
  userId: string
) => {
  const { sessionId } = data;

  const userCart = await getCartService(userId);
  const guestCart = await getCartService(undefined, sessionId);

  if (guestCart.items.length === 0) {
    return {
      statusCode: httpStatus.OK,
      success: true,
      message: "Carts merged successfully",
      error: null,
      data: userCart,
    };
  }

  // Add guest cart items to user cart
  for (const guestItem of guestCart.items) {
    try {
      await addToCartService(
        {
          productId: guestItem.productId,
          quantity: guestItem.quantity,
          size: guestItem.size || undefined,
          color: guestItem.color || undefined,
          colorCode: guestItem.colorCode || undefined,
        },
        userId,
        undefined
      );
    } catch (error) {
      // Skip items that are no longer available
      console.warn(
        `Skipping unavailable product during merge: ${guestItem.productId}`
      );
      continue;
    }
  }

  // Delete guest cart
  await CartModel.deleteOne({ sessionId });

  const mergedCart = await getCartService(userId);

  return {
    statusCode: httpStatus.OK,
    success: true,
    message: "Carts merged successfully",
    error: null,
    data: mergedCart,
  };
};

export const validateCartService = async (userId: string) => {
  const cart = await getCartService(userId);

  if (cart.items.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Cart is empty");
  }

  // Refresh prices and availability one more time
  const updatedCart = await refreshCartPricesService(cart);

  const unavailableItems = updatedCart.items.filter(
    (item: ICartItem) => !item.isAvailable // FIXED: Added ICartItem type
  );
  if (unavailableItems.length > 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Some items in your cart are no longer available"
    );
  }

  const outOfStockItems = updatedCart.items.filter(
    (item: ICartItem) => item.quantity > item.productStock // FIXED: Added ICartItem type
  );
  if (outOfStockItems.length > 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Some items have insufficient stock"
    );
  }

  return {
    statusCode: httpStatus.OK,
    success: true,
    message: "Cart is valid for checkout",
    error: null,
    data: updatedCart,
  };
};

// Internal service functions
const refreshCartPricesService = async (cart: any) => {
  let hasChanges = false;

  for (const item of cart.items) {
    const product = await ProductModel.findById(item.productObjectId).select(
      "productName productPrice productStock productSize productColor productColorCode productCoverImage isDisplayable isSaleable"
    );

    if (product) {
      const currentPrice = product.productPrice || 0;
      const currentStock = product.productStock || 0;
      const isAvailable =
        currentStock > 0 && product.isSaleable && product.isDisplayable;

      // Check if any values changed
      if (
        item.pricePerUnit !== currentPrice ||
        item.productStock !== currentStock ||
        item.isAvailable !== isAvailable ||
        item.productName !== product.productName
      ) {
        hasChanges = true;
      }

      // Update values
      item.pricePerUnit = currentPrice;
      item.productStock = currentStock;
      item.isAvailable = isAvailable;
      item.totalPrice = currentPrice * item.quantity;
      item.productName = product.productName!; // FIXED: Using non-null assertion

      // Update product image if available
      if (product.productCoverImage?.filePathURL) {
        item.productImage = product.productCoverImage.filePathURL;
      }

      // Update size/color if not specifically chosen by user
      if (!item.size && product.productSize) {
        item.size = product.productSize;
      }
      if (!item.color && product.productColor) {
        item.color = product.productColor;
      }
      if (!item.colorCode && product.productColorCode) {
        item.colorCode = product.productColorCode;
      }
    } else {
      // Product no longer exists
      if (item.isAvailable) {
        hasChanges = true;
        item.isAvailable = false;
      }
    }
  }

  // Remove unavailable items
  const originalLength = cart.items.length;
  cart.items = cart.items.filter((item: ICartItem) => item.isAvailable); // FIXED: Added ICartItem type

  if (cart.items.length !== originalLength) {
    hasChanges = true;
  }

  if (hasChanges) {
    return await calculateCartTotalsService(cart);
  }

  return cart;
};

const calculateCartTotalsService = async (cart: any) => {
  cart.totalItems = cart.items.reduce(
    (sum: number, item: ICartItem) => sum + item.quantity, // FIXED: Added ICartItem type
    0
  );
  cart.cartTotal = cart.items.reduce((sum: number, item: ICartItem) => {
    // FIXED: Added ICartItem type
    return sum + (item.totalPrice || 0);
  }, 0);

  return await cart.save();
};
