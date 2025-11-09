import { email, z } from "zod";

export const passwordSchema = z
  .string({ message: "Password is required" })
  .min(6, { message: "Password must be at least 6 characters long" })
  .max(30, { message: "Password must be at most 30 characters long" })
  .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/, {
    message: "Password must contain both letters and numbers",
  });
export const loginSchema = z.object({
  email: z.string({ message: "Invalid email address!" }).trim().email(),
  password: passwordSchema,
}).strict();
//export type LoginInput = z.infer<typeof loginSchema>["body"];
export const emailSchema = z.object({
  email: z.string({ message: "Invalid email address!" }).trim().email(),
});
export const otpSchema = z.object({
  otp: z
    .string({ message: "otp must be send in string format and non empty" })
    .regex(/^\d{6}$/, { message: "OTP must be exactly 6 digits number" }),
  email: z.string({ message: "Invalid email address!" }).trim().email(),
});

export const changePasswordSchema = z
  .object({
    email: z.string({ message: "Invalid email address!" }).trim().email(),
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // highlight confirmPassword field
  });
export const changePasswordFromProfileSchema = z
  .object({
    _id: z.string().trim().min(2).max(100),
    currentPassword: passwordSchema,
    newPassword: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // highlight confirmPassword field
  });