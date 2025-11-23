// src/modules/cart/cart.route.ts
import express from "express";
import {
  
  addToCartController,
  
} from "./cart.controller";
import { verifyAccessTokenMiddleware } from "../../middlewares/verifyTokenMiddleware";
import { roleCheckMiddleware } from "../../middlewares/roleCheckMiddleware";

const router = express.Router();

// Public routes (require session ID in header)
//router.get("/", getCartController);
router.post("/add", verifyAccessTokenMiddleware,roleCheckMiddleware('customer'),addToCartController);
// router.put("/update", updateCartItemController);
// router.delete("/remove", removeFromCartController);
// router.delete("/clear", clearCartController);

// // Protected routes (require authentication)
// router.post("/merge", verifyAccessTokenMiddleware, mergeCartsController);
// router.get("/validate", verifyAccessTokenMiddleware, validateCartController);

export const cartRoutes = router;