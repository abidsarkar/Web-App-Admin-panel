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
});
export const addressSchema = z.object({
  division: z.string().max(30).trim().optional(),
  district: z.string().max(30).trim().optional(),
  upazila: z.string().max(30).trim().optional(),
  village_road_house_flat: z.string().max(200).trim(),
});
//register new customer schema
export const registerNewCustomerSchema = z
  .object({
    firstName: z
      .string({ message: "name is required" })
      .min(1, { message: "Name cannot be empty" })
      .max(25, { message: "name must be under 50 character" }),
    lastName: z
      .string({ message: "name is required" })
      .min(1, { message: "Name cannot be empty" })
      .max(25, { message: "name must be under 50 character" })
      .optional(),
    email: z.string({ message: "email is required" }).trim().email(),
    phone: z
      .string()
      .min(1, { message: "phone number cannot be empty" })
      .max(18, {
        message:
          "to much number character for phone number use a valid phone number",
      }),
    address: addressSchema,
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "passwords do not match",
    path: ["confirmPassword"],
  });
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