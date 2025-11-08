import { email, z } from "zod";
import { MAX_PROFILE_PIC_SIZE } from "../../config/envConfig";

export const getProfileSchema = z
  .object({
    _id: z.string().trim().min(2).max(100),
  })
  .strict();

export const getProfileForAdminSchema = z.object({
  _id: z.string().trim().min(2).max(100).optional(),
  email: z.string().trim().email().optional(),
});

export const addressSchema = z.object({
  division: z.string().max(30).trim().optional(),
  district: z.string().max(30).trim().optional(),
  upazila: z.string().max(30).trim().optional(),
  village_road_house_flat: z.string().max(200).trim().optional(),
});
//update customer profile schema
export const updateCustomerProfileSchema = z.object({
  firstName: z.string().trim().min(2).max(50).optional(),
  lastName: z.string().trim().min(2).max(50).optional(),
  phone: z.string().trim().min(11).max(15).optional(),
  secondaryPhoneNumber: z.string().trim().min(11).max(15).optional(),
  address: addressSchema.optional(),
});
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