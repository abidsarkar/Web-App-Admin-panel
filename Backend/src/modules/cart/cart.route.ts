// src/modules/cart/cart.route.ts
import express from "express";
import {
  getCartController,
  addToCartController,
  updateCartItemController,
  removeFromCartController,
  clearCartController,
  mergeCartsController,
  validateCartController
} from "./cart.controller";
import { verifyAccessTokenMiddleware } from "../../middlewares/verifyTokenMiddleware";

const router = express.Router();

// Public routes (require session ID in header)
router.get("/", getCartController);
router.post("/add", addToCartController);
router.put("/update", updateCartItemController);
router.delete("/remove", removeFromCartController);
router.delete("/clear", clearCartController);

// Protected routes (require authentication)
router.post("/merge", verifyAccessTokenMiddleware, mergeCartsController);
router.get("/validate", verifyAccessTokenMiddleware, validateCartController);

export const cartRoutes = router;