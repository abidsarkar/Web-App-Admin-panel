import { z } from "zod";
export const passwordSchema = z
  .string({ message: "password is required in string formate" })
  .min(6, { message: "Password must be at least 6 characters long" })
  .max(30, { message: "Password must be at most 30 characters long" })
  .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/, {
    message: "Password must contain both letters and numbers",
  });
export const createEmployerSchema = z.object({
  name: z
    .string({ message: "name is required" })
    .min(1, { message: "Name cannot be empty" })
    .max(50, { message: "name must be under 50 character" }),
  email: z.string({ message: "email is required" }).trim().email(),
  phone: z
    .string()
    .min(1, { message: "phone number cannot be empty" })
    .max(18, {
      message:
        "to much number character for phone number use a valid phone number",
    }),
  secondaryPhoneNumber: z
    .string({ message: "secondaryPhoneNumber must be in string" })
    .min(1, { message: "secondaryPhoneNumber cannot be empty" })
    .max(18, {
      message:
        "to much number character for secondaryPhoneNumber use a valid phone number",
    })
    .optional(), //! this is for optional check if not come from body zod ignore
  address: z
    .string({ message: "address must be in string" })
    .min(1, { message: "address number cannot be empty" })
    .max(200, { message: "address must be under 200 character" })
    .optional(), //! this is for optional check if not come from body zod ignore
  profilePic: z
    .string({ message: "profilePic must be in string" })
    .min(1, { message: "profilePic cannot be empty" })
    .optional(), //! this is for optional check if not come from body zod ignore
  profilePic_src: z
    .string({ message: "profilePic_src must be in string" })
    .min(1, { message: "profilePic_src cannot be empty" })
    .optional(), //! this is for optional check if not come from body zod ignore
  position: z
    .string({ message: "position must be in string" })
    .min(1, { message: "position cannot be empty" })
    .optional(), //! this is for optional check if not come from body zod ignore
  employer_id: z
    .string()
    .min(1, { message: "employer_id cannot be empty" })
    .max(20, { message: "employer_id must be under 20 character" }),
  role: z
    .union([z.enum(["subAdmin", "superAdmin", "undefined"]), z.undefined()])
    .optional(), //! this is for optional check if not come from body zod ignore
  isActive: z.boolean().optional(),
  password: passwordSchema.optional(),
});

export const getEmployerInfoSchema = z.object({
  email: z.string().trim().email().optional(),
  employer_id: z.string().trim().optional(),
});
export const deleteEmployerInfoSchema = z.object({
  email: z.string().trim().email(),
  employer_id: z.string().trim(),
}).strict();
