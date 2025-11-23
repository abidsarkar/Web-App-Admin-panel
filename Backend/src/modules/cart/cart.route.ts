// src/modules/cart/cart.route.ts
import express from "express";
import {
  addToCartController,
  deleteCartController,
  getCartController,
  removeFromCartController,
} from "./cart.controller";
import { verifyAccessTokenMiddleware } from "../../middlewares/verifyTokenMiddleware";
import { roleCheckMiddleware } from "../../middlewares/roleCheckMiddleware";

const router = express.Router();

// Public routes (require session ID in header)
router.get(
  "/get",
  verifyAccessTokenMiddleware,
  roleCheckMiddleware("customer"),
  getCartController
);
router.post(
  "/add",
  verifyAccessTokenMiddleware,
  roleCheckMiddleware("customer"),
  addToCartController
);
router.delete(
  "/remove",
  verifyAccessTokenMiddleware,
  roleCheckMiddleware("customer"),
  removeFromCartController
);
router.delete(
  "/delete",
  verifyAccessTokenMiddleware,
  roleCheckMiddleware("customer"),
  deleteCartController
);
// router.put("/update", updateCartItemController);
// router.delete("/clear", clearCartController);

// // Protected routes (require authentication)
// router.post("/merge", verifyAccessTokenMiddleware, mergeCartsController);
// router.get("/validate", verifyAccessTokenMiddleware, validateCartController);

export const cartRoutes = router;
