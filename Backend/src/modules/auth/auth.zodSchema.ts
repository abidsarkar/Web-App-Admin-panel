import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .email({ message: "Invalid email address" }),
  password: z
    .string({ message: "Password is required" })
    .min(6, { message: "Password must be at least 6 characters" }),
});
//export type LoginInput = z.infer<typeof loginSchema>["body"];
export const emailSchema = z.email();