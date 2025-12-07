import { z } from "zod";
import { PaymentMethod } from "./order.interface";

export const placeOrderSchema = z.object({
  body: z.object({
    shippingAddress: z.object({
      division: z.string().min(1, "Division is required"),
      district: z.string().min(1, "District is required"),
      upazila: z.string().min(1, "Upazila is required"),
      address: z.string().min(1, "Detailed address is required"),
    }),
    contactNumber: z.string().min(1, "Contact number is required"),
    paymentMethod: z.nativeEnum(PaymentMethod),
    paymentDetails: z
      .object({
        transactionId: z.string().optional(),
        phoneNumber: z.string().optional(),
        gateway: z.string().optional(),
      })
      .optional(),
  }),
});
