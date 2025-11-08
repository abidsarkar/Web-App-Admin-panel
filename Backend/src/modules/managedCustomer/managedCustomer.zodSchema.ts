import { email, z } from "zod";

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
