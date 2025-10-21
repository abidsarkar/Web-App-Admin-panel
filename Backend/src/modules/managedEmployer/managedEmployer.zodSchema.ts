import { z } from "zod";
import { MAX_PROFILE_PIC_SIZE } from "../../config/envConfig";
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
  isActive: z
    .preprocess((val) => {
      if (val === "true") return true;
      if (val === "false") return false;
      return val;
    }, z.boolean())
    .optional(),
  password: passwordSchema.optional(),
});
//update body part
export const updateEmployerSchema = z.object({
  name: z
    .string()
    .max(50, { message: "name must be under 50 character" })
    .optional(),
  email: z.string({ message: "email is required" }).trim().email(),
  phone: z
    .string()
    .max(18, {
      message:
        "to much number character for phone number use a valid phone number",
    })
    .optional(), //! optional for update
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
  position: z
    .string({ message: "position must be in string" })
    .min(1, { message: "position cannot be empty" })
    .optional(), //! this is for optional check if not come from body zod ignore
  employer_id: z
    .string()
    .min(1, { message: "employer_id cannot be empty" })
    .max(20, { message: "employer_id must be under 20 character" })
    .optional(),
  role: z
    .union([z.enum(["subAdmin", "superAdmin", "undefined"]), z.undefined()])
    .optional(), //! this is for optional check if not come from body zod ignore
  isActive: z
    .preprocess((val) => {
      if (val === "true") return true;
      if (val === "false") return false;
      return val;
    }, z.boolean())
    .optional(),
  password: passwordSchema.optional(),
});

export const getEmployerInfoSchema = z.object({
  email: z.string().trim().email().optional(),
  employer_id: z.string().trim().optional(),
});

export const getAllEmployerInfoSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)), // default page = 1
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10)), // default limit = 10
  search: z.string().optional(), // optional search query (e.g., by name or email)
  isActive: z.preprocess((val) => {
    if (val === "true") return true;
    if (val === "false") return false;
    return val;
  }, z.boolean().optional()), // optional filter
  sort: z.string().optional(), // e.g. "createdAt"
  order: z.enum(["asc", "desc"]).optional(), // default desc
});
export const deleteEmployerInfoSchema = z
  .object({
    email: z.string().trim().email(),
    employer_id: z.string().trim(),
  })
  .strict();

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/jpg",
  "image/webp",
  "image/avif",
];

export const uploadProfilePictureSchema = z.object({
  profilePicture: z
    .file()
    .optional() // Make the file optional
    .refine(
      (file) => !file || file.size <= MAX_PROFILE_PIC_SIZE,
      `File size must be less than ${MAX_PROFILE_PIC_SIZE / (1024 * 1024)}MB`
    )
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
      `File must be one of ${ACCEPTED_IMAGE_TYPES.join(", ")}`
    ),
});
export const fileSchema = z.object({
  fieldname: z.string(),
  originalname: z.string(),
  encoding: z.string(),
  mimetype: z.string(),
  destination: z.any().optional(),
  filename: z.string(),
  path: z.string().optional(),
  buffer: z.any().optional(), // or path if you save files
  size: z.number(),
});
