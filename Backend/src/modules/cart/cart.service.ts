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
import { calculateItemTotalPrice, ObjectIdUtils, validateProductForCart } from "./cart.utils";
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
    (cartItem: any) =>
      cartItem.productId === productId &&
      cartItem.size === size &&
      cartItem.color === color
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
      productName: product.productName,
      productImage: product.productCoverImage.filePathURL,
      pricePerUnit: product.productPrice,
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
export const getCartWithCache = async (customerId: string) => {
  // Try cache first
  const cachedCart = await getCachedUserCart(customerId);

  if (cachedCart) {
    return {
      statusCode: httpStatus.OK,
      success: true,
      message: "Item retrieve successfully!",
      error: null,
      data: {
        cart: cachedCart,
      },
    };
  }

  // If not in cache, get from database
  const cart = await CartModel.findOne({ userId: customerId });

  if (cart) {
    // Cache the cart for future requests
    await cacheUserCart(customerId, {
      ...cart.toObject(),
      cachedAt: new Date().toISOString(),
    });
  }

  return {
    statusCode: httpStatus.OK,
    success: true,
    message: "Item retrieve successfully",
    error: null,
    data: {
      cart: cart,
    },
  };
};
export const removeFromCartService = async (
  data: z.infer<typeof removeFromCartSchema>,
  customerId: string
) => {
  const { userId, productId, size, color } = data;

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
  // 2. Get user's cart
  // -----------------------------------------
  const cart = await CartModel.findOne({ userId });

  if (!cart || cart.items.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "Cart is empty or not found");
  }

  // -----------------------------------------
  // 3. Find and remove the item
  // -----------------------------------------
  const initialItemCount = cart.items.length;

  // Filter out the item to remove
  cart.items = cart.items.filter(
    (item) =>
      !(
        item.productId === productId &&
        (size ? item.size === size : true) &&
        (color ? item.color === color : true)
      )
  );

  // Check if item was actually removed
  if (cart.items.length === initialItemCount) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Item not found in cart. It may have been already removed."
    );
  }

  // Update cart timestamp
  cart.updatedAt = new Date();

  // -----------------------------------------
  // 4. Save updated cart
  // -----------------------------------------
  const updatedCart = await cart.save();

  // -----------------------------------------
  // 5. Update Cache
  // -----------------------------------------

  // Invalidate user cart cache
  await invalidateUserCartCache(customerId);

  // Update cache with new cart data
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
  // 6. Response
  // -----------------------------------------
  return {
    statusCode: httpStatus.OK,
    success: true,
    message: "Item removed from cart successfully",
    error: null,
    data: {
      accessToken,
      cart: updatedCart,
      removedItem: { productId, size, color },
    },
  };
};
// Clear entire cart
export const clearCartService = async (userId: string) => {
  // Check valid user
  const existingUser = await customerInfoModel
    .findById(userId)
    .select("-password");

  if (!existingUser || existingUser.isDeleted) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
  }

  if (existingUser.isActive === false) {
    throw new ApiError(httpStatus.FORBIDDEN, "User account deactivated!");
  }
  // -----------------------------------------
  // 2. Get and clear cart
  // -----------------------------------------
  const cart = await CartModel.findOneAndDelete({ userId });

  // -----------------------------------------
  // 3. Update Cache
  // -----------------------------------------

  await invalidateUserCartCache(userId);

  const accessToken = generateAccessToken({
    id: userId,
    role: existingUser.role,
    email: existingUser.email,
  });

  // -----------------------------------------
  // 4. Response
  // -----------------------------------------
  return {
    statusCode: httpStatus.OK,
    success: true,
    message: "cart is deleted successful",
    error: null,
    data: {
      accessToken,
    },
  };
};
export const updateCartItemService = async (
  data: z.infer<typeof updateCartItemSchema>,
  customerId: string
) => {
  const { productId, quantity, size, color } = data;

  // -----------------------------------------
  // 1. Validate user identity
  // -----------------------------------------

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
  // 2. Get user's cart
  // -----------------------------------------
  const cart = await CartModel.findOne({ userId: customerId });

  if (!cart || cart.items.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "Cart is empty or not found");
  }

  
  // -----------------------------------------
  // 3. Find the item to update
  // -----------------------------------------
  const itemIndex = cart.items.findIndex(
    (item) =>
      item.productId === productId &&
      (size ? item.size === size : true) &&
      (color ? item.color === color : true)
  );

  if (itemIndex === -1) {
    throw new ApiError(httpStatus.NOT_FOUND, "Item not found in cart");
  }

  const cartItem = cart.items[itemIndex];

  const obj = new Types.ObjectId(cartItem.productObjectId);
  // -----------------------------------------
  // 4. Handle quantity update
  // -----------------------------------------
  if (quantity === 0) {
    // Remove item if quantity is 0
    cart.items.splice(itemIndex, 1);
  } else {
    // Validate product availability for new quantity
    const validationResult = await validateProductForCart({
      productObjectId: ObjectIdUtils.toString(cartItem.productObjectId),
      productId: cartItem.productId,
      size: cartItem.size,
      color: cartItem.color,
      quantity: quantity,
    });

    if (!validationResult.isValid) {
      throw new ApiError(httpStatus.BAD_REQUEST, validationResult.error!);
    }

    const { product } = validationResult;
// With this:
if (!product||product.productPrice === undefined || product.productPrice === null) {
  throw new ApiError(httpStatus.BAD_REQUEST, "Product price is not available");
}
    // Update item quantity and price
    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].totalPrice = calculateItemTotalPrice(
      product.productPrice,
      quantity
    );
    cart.items[itemIndex].pricePerUnit = product.productPrice;
    

    
  }

  // Update cart timestamp
  cart.updatedAt = new Date();

  // -----------------------------------------
  // 5. Save updated cart
  // -----------------------------------------
  const updatedCart = await cart.save();
  

  // -----------------------------------------
  // 6. Update Cache
  // -----------------------------------------
  
    // Invalidate user cart cache
    await invalidateUserCartCache(customerId);

    // Update cache with new cart data
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
  const message =
    quantity === 0
      ? "Item removed from cart successfully"
      : "Cart item quantity updated successfully";

  return {
    statusCode: httpStatus.OK,
    success: true,
    message,
    error: null,
    data: {
      accessToken,
      cart: updatedCart,
      updatedItem:
        quantity === 0
          ? null
          : {
              productId,
              size,
              color,
              oldQuantity: cartItem.quantity,
              newQuantity: quantity,
              pricePerUnit: cart.items[itemIndex]?.pricePerUnit,
              totalPrice: cart.items[itemIndex]?.totalPrice,
            },
      removedItem:
        quantity === 0
          ? {
              productId,
              size,
              color,
              productName: cartItem.productName,
            }
          : null,
    },
  };
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
