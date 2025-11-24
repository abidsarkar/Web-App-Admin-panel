// src/modules/cart/cart.utils.ts=
import { ProductModel } from "../product/product.model";

export const validateProductForCart = async (item: {
  productObjectId: string;
  productId: string;
  size?: string;
  color?: string;
  quantity: number;
}) => {
  const { productObjectId, productId, size, color, quantity } = item;

  // -----------------------------------------
  // 1. Validate Product Existence & Availability
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
    return {
      isValid: false,
      error: "Product not found or not available",
      product: null,
    };
  }

  // -----------------------------------------
  // 2. Price Validation
  // -----------------------------------------
  if (product.productPrice == null || product.productPrice <= 0) {
    return {
      isValid: false,
      error:
        "This product has no price. You cannot add it to your cart right now.",
      product: null,
    };
  }

  // -----------------------------------------
  // 3. Stock Validation
  // -----------------------------------------
  if (product.productStock && product.productStock < quantity) {
    return {
      isValid: false,
      error: "Insufficient stock for requested quantity",
      product: null,
    };
  }

  // -----------------------------------------
  // 4. Size/Color Validation (if needed)
  // -----------------------------------------
  if (size && product.productSize && !product.productSize.includes(size)) {
    return {
      isValid: false,
      error: `Size ${size} not available for this product`,
      product: null,
    };
  }

  if (color && product.productColor && !product.productColor.includes(color)) {
    return {
      isValid: false,
      error: `Color ${color} not available for this product`,
      product: null,
    };
  }

  return {
    isValid: true,
    error: null,
    product: product,
  };
};
export const calculateItemTotalPrice = (
  price: number,
  quantity: number
): number => {
  // Prevent floating point precision issues
  return Math.round(price * quantity * 100) / 100;
};

import { Types } from "mongoose";

export class ObjectIdUtils {
  /**
   * Safely convert to ObjectId
   */
  static toObjectId(id: string | Types.ObjectId): Types.ObjectId {
    if (id instanceof Types.ObjectId) {
      return id;
    }

    if (typeof id === "string" && Types.ObjectId.isValid(id)) {
      return new Types.ObjectId(id);
    }

    throw new Error(`Invalid ObjectId: ${id}`);
  }

  /**
   * Safely convert to string
   */
  static toString(id: string | Types.ObjectId): string {
    if (id instanceof Types.ObjectId) {
      return id.toString();
    }

    if (typeof id === "string") {
      return id;
    }

    throw new Error(`Invalid id type: ${typeof id}`);
  }

  /**
   * Check if valid ObjectId
   */
  static isValid(id: string | Types.ObjectId): boolean {
    if (id instanceof Types.ObjectId) {
      return true;
    }

    if (typeof id === "string") {
      return Types.ObjectId.isValid(id);
    }

    return false;
  }
}
export const validateOfflineItems = async (offlineItems: any[]) => {
  const validItems: any[] = [];
  const invalidItems: any[] = [];

  // Validate each item individually
  for (const item of offlineItems) {
    const validationResult = await validateProductForCart({
      productObjectId: item.productObjectId,
      productId: item.productId,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
    });

    // Check if product exists and is valid
    if (!validationResult.product) {
      invalidItems.push({
        item,
        reason: validationResult.error || "Product not found",
      });
      continue; // Skip to next item
    }

    // Check if product price is valid
    if (
      validationResult.product.productPrice == null ||
      validationResult.product.productPrice <= 0
    ) {
      invalidItems.push({
        item,
        reason: "Product has no valid price",
      });
      continue; // Skip to next item
    }

    // If validation passed, add to valid items
    if (validationResult.isValid) {
      // Update prices in case they changed online
      const updatedItem = {
        ...item,
        productName: validationResult.product.productName,
        pricePerUnit: validationResult.product.productPrice,
        totalPrice: calculateItemTotalPrice(
          validationResult.product.productPrice,
          item.quantity
        ),
        updatedAt: new Date(),
      };
      validItems.push(updatedItem);
    } else {
      invalidItems.push({
        item,
        reason: validationResult.error || "Product validation failed",
      });
    }
  }

  return { validItems, invalidItems };
};
/**
 * Merge offline items into online cart (combine quantities)
 */
export const mergeCartItems = async (cart: any, offlineItems: any[]) => {
  let addedCount = 0;
  let updatedCount = 0;

  for (const offlineItem of offlineItems) {
    const existingIndex = cart.items.findIndex(
      (onlineItem: any) =>
        onlineItem.productId === offlineItem.productId &&
        onlineItem.size === offlineItem.size &&
        onlineItem.color === offlineItem.color
    );

    if (existingIndex === -1) {
      // Add new item from offline cart
      cart.items.push(offlineItem);
      addedCount++;
    } else {
      // Combine quantities for existing item
      const onlineItem = cart.items[existingIndex];
      const oldQuantity = onlineItem.quantity;
      const newQuantity = oldQuantity + offlineItem.quantity;

      // Validate the combined quantity
      const validationResult = await validateProductForCart({
        productObjectId: onlineItem.productObjectId,
        productId: onlineItem.productId,
        size: onlineItem.size,
        color: onlineItem.color,
        quantity: newQuantity,
      });

      // Check if validation passed and product exists
      if (validationResult.isValid && validationResult.product && validationResult.product.productPrice) {
        // Update with combined quantity
        cart.items[existingIndex].quantity = newQuantity;
        cart.items[existingIndex].totalPrice = calculateItemTotalPrice(
          validationResult.product.productPrice,
          newQuantity
        );
        cart.items[existingIndex].pricePerUnit = validationResult.product.productPrice;
        cart.items[existingIndex].updatedAt = new Date();
        updatedCount++;
      } else {
        // If validation fails, use the larger quantity with existing price
        const finalQuantity = Math.max(oldQuantity, offlineItem.quantity);
        
        // Ensure onlineItem.pricePerUnit exists and is a number
        const pricePerUnit = typeof onlineItem.pricePerUnit === 'number' && onlineItem.pricePerUnit > 0 
          ? onlineItem.pricePerUnit 
          : 0; // Fallback to 0 if invalid
        
        cart.items[existingIndex].quantity = finalQuantity;
        cart.items[existingIndex].totalPrice = calculateItemTotalPrice(
          pricePerUnit,
          finalQuantity
        );
        
        // Only update pricePerUnit if it was invalid
        if (pricePerUnit === 0 && validationResult.product?.productPrice) {
          cart.items[existingIndex].pricePerUnit = validationResult.product.productPrice;
        }
        
        cart.items[existingIndex].updatedAt = new Date();
        updatedCount++;
      }
    }
  }

  return { addedCount, updatedCount };
};
