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
import { calculateItemTotalPrice, validateProductForCart } from "./cart.utils";
import {
  cacheProductAvailability,
  cacheUserCart,
  getCachedProductAvailability,
  getCachedUserCart,
  invalidateProductAvailability,
  invalidateUserCartCache,
} from "./cart.redis";
import { generateAccessToken } from "../../utils/JwtToken";

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

  // For now, just process the first item (single product)
  const item = items[0];

  
  // -----------------------------------------
  // 3. Check product availability with cache
  // -----------------------------------------

  // Fetch from database
  const validationResult = await validateProductForCart(item);

  if (!validationResult.isValid) {
    throw new ApiError(httpStatus.BAD_REQUEST, validationResult.error!);
  }

  const { product } = validationResult;
  
  // -----------------------------------------
  // 4. Get or Create Cart from db. no cached 
  // -----------------------------------------
  const cart = await getOrCreateCart(userId);
  

  // -----------------------------------------
  // 5. Update Cart with Item
  // -----------------------------------------
  const updatedCart = await updateCartItem(cart, item, product, item.quantity);
  
   // -----------------------------------------
  // 6. Update Cache (invalidate and set new)
  // -----------------------------------------
  
    // Invalidate user cart cache first
    await invalidateUserCartCache(customerId);
    
    // Then cache the updated cart
    await cacheUserCart(customerId, {
      ...updatedCart.toObject(),
      cachedAt: new Date().toISOString(),
    });
  
  const accessToken = generateAccessToken({
    id: customerId,
    role: existingUser.role,
    email: existingUser.email,
  });
  // -----------------------------------------
  // 7. Response
  // -----------------------------------------
  return {
    statusCode: httpStatus.OK,
    success: true,
    message: "Item added to cart successfully",
    error: null,
    data: {
      accessToken,
      cart: updatedCart,
    },
  };
};

export const getOrCreateCart = async (userId: string) => {

  let cart = await CartModel.findOne({ userId });

  if (!cart) {
    console.log("Creating new cart for user:", userId);
    cart = new CartModel({
      userId,
      items: [],
    });
    // Save the new cart to database immediately
    await cart.save();
  } 
  return cart;
};

export const updateCartItem = async (
  cart: any,
  item: any,
  product: any,
  quantity: number
) => {
  const { productId, size, color } = item;
  
  // Find existing item with same productId, size, and color
  const existingItemIndex = cart.items.findIndex(
    (cartItem: any) => cartItem.productId === productId
     && cartItem.size === size && cartItem.color === color
  );

  // If item exists → update quantity
  if (existingItemIndex > -1) {
    const newQuantity = cart.items[existingItemIndex].quantity + quantity;

    // Additional stock check for updated quantity
    if (product.productStock && product.productStock < newQuantity) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Insufficient stock for ${product.productName}. Available: ${product.productStock}, Requested: ${newQuantity}`
      );
    }

    cart.items[existingItemIndex].quantity = newQuantity;
    cart.items[existingItemIndex].totalPrice = calculateItemTotalPrice(
      product.productPrice,
      newQuantity
    );

    // Update item updatedAt timestamp
    cart.items[existingItemIndex].updatedAt = new Date();
  }
  // If NEW item → push into cart
  else { 
    const newItem = {
      ...item,
      productName:product.productName,
      productImage:product.productCoverImage.filePathURL,
      pricePerUnit:product.productPrice,
      totalPrice: calculateItemTotalPrice(product.productPrice, quantity),
      addedAt: new Date(),
      updatedAt: new Date(),
    };
    
    cart.items.push(newItem);
  }

  // Update cart timestamps
  cart.updatedAt = new Date();

  // Save the cart
  const updatedCart = await cart.save();
  return updatedCart;
};

// Additional helper function to get cart with cache
export const getCartWithCache = async (userId: string) => {
  // Try cache first
  const cachedCart = await getCachedUserCart(userId);

  if (cachedCart) {
    return {
      cart: cachedCart,
      fromCache: true,
    };
  }

  // If not in cache, get from database
  const cart = await CartModel.findOne({ userId });

  if (cart) {
    // Cache the cart for future requests
    try {
      await cacheUserCart(userId, {
        ...cart.toObject(),
        cachedAt: new Date().toISOString(),
      });
    } catch (cacheError) {
      console.error("Failed to cache cart:", cacheError);
    }
  }

  return {
    cart,
    fromCache: false,
  };
};

// Function to clear cart cache (useful for testing or admin operations)
export const clearCartCache = async (userId: string) => {
  try {
    await invalidateUserCartCache(userId);
    return {
      success: true,
      message: "Cart cache cleared successfully",
    };
  } catch (error) {
    console.error("Failed to clear cart cache:", error);
    return {
      success: false,
      message: "Failed to clear cart cache",
    };
  }
};
// const processMultipleItems = async (items: any[], userId: string) => {
//   const validationResults = await Promise.all(
//     items.map(item => validateProductForCart(item))
//   );

//   const validItems = [];
//   const errors = [];

//   validationResults.forEach((result, index) => {
//     if (result.isValid) {
//       validItems.push({ item: items[index], product: result.product });
//     } else {
//       errors.push(`Item ${index + 1}: ${result.error}`);
//     }
//   });

//   if (errors.length > 0) {
//     throw new ApiError(httpStatus.BAD_REQUEST, errors.join('; '));
//   }

//   const cart = await getOrCreateCart(userId);

//   for (const { item, product } of validItems) {
//     await updateCartItem(cart, item, product, item.quantity);
//   }

//   return await cart.save();
// };
