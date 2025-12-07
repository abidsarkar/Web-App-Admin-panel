import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { OrderControllers } from "./order.controller";
import { placeOrderSchema } from "./order.zodSchema";
import { verifyAccessTokenMiddleware } from "../../middlewares/verifyTokenMiddleware";

const router = express.Router();

router.post(
  "/place",
  verifyAccessTokenMiddleware,
  validateRequest(placeOrderSchema),
  OrderControllers.placeOrder
);

export const OrderRoutes = router;
