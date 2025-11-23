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
      error: "This product has no price. You cannot add it to your cart right now.",
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
export const calculateItemTotalPrice = (price: number, quantity: number): number => {
  // Prevent floating point precision issues
  return Math.round((price * quantity) * 100) / 100;
};
// src/utils/objectIdUtils.ts
import { Types } from "mongoose";

export class ObjectIdUtils {
  /**
   * Safely convert to ObjectId
   */
  static toObjectId(id: string | Types.ObjectId): Types.ObjectId {
    if (id instanceof Types.ObjectId) {
      return id;
    }
    
    if (typeof id === 'string' && Types.ObjectId.isValid(id)) {
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
    
    if (typeof id === 'string') {
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
    
    if (typeof id === 'string') {
      return Types.ObjectId.isValid(id);
    }
    
    return false;
  }
}