import { z } from "zod";

export const textSchema = z.object({
  // About Information Section (all optional)
  aboutUs: z
    .string()
    .trim()
    .min(1, "About us cannot be empty")
    .max(2000, "About us to much long make it below 2000")
    .optional(),
  achievements: z
    .string()
    .trim()
    .min(1, "Achievements cannot be empty")
    .optional(),
  officeHours: z
    .string()
    .trim()
    .min(1, "Office hours cannot be empty")
    .max(100, "Office hours to much long make it below 100")
    .optional(),
  // Contact Information Section (all optional)
  map: z.string().trim().url("Please enter a valid map URL").optional(),
  address: z
    .string()
    .trim()
    .min(1, "Address cannot be empty")
    .max(500, "Address to much long make it below 500")
    .optional(),
  contactPhone: z
    .string()
    .trim()
    .regex(/^[+]?[\d\s\-()]{15,}$/, "Please enter a valid phone number")
    .optional()
    ,
  contactEmail: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address")
    .optional(),

  // Social Media Links Section (all optional)
  facebookLink: z
    .string()
    .trim()
    .url("Please enter a valid Facebook URL")
    .optional()
    ,
  youtubeLink: z
    .string()
    .trim()
    .url("Please enter a valid YouTube URL")
    .optional()
    ,
  instagramLink: z
    .string()
    .trim()
    .url("Please enter a valid Instagram URL")
    .optional()
    ,
  xLink: z
    .string()
    .trim()
    .url("Please enter a valid X/Twitter URL")
    .optional()
    ,
  githubLink: z
    .string()
    .trim()
    .url("Please enter a valid GitHub URL")
    .optional()
    ,
  linkedinLink: z
    .string()
    .trim()
    .url("Please enter a valid LinkedIn URL")
    .optional()
    ,
  tiktokLink: z
    .string()
    .trim()
    .url("Please enter a valid TikTok URL")
    .optional()
    ,

  // Terms and Policies Section (all optional)
  termsOfService: z
    .string()
    .trim()
    .min(1, "Terms of service cannot be empty")
    .optional()
    ,
  privacyPolicy: z
    .string()
    .trim()
    .min(1, "Privacy policy cannot be empty")
    .optional()
    ,
  shippingPolicy: z
    .string()
    .trim()
    .min(1, "Shipping policy cannot be empty")
    .optional()
    ,
  returnPolicy: z
    .string()
    .trim()
    .min(1, "Return policy cannot be empty")
    .optional()
    ,
  refundPolicy: z
    .string()
    .trim()
    .min(1, "Refund policy cannot be empty")
    .optional()
    ,
  cookiePolicy: z
    .string()
    .trim()
    .min(1, "Cookie policy cannot be empty")
    .optional()
    ,

  // Restriction and Legal Section (all optional)
  shippingRestriction: z
    .string()
    .trim()
    .min(1, "Shipping restriction cannot be empty")
    .optional()
    ,
  disclaimer: z
    .string()
    .trim()
    .min(1, "Disclaimer cannot be empty")
    .optional()
    ,

  // Timestamps (auto-generated, usually not in input)
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});


// Partial schema for updates (all fields optional)
export const updateTextSchema = textSchema.partial();

// Strict schema for creation (all fields optional but with validation)
export const createTextSchema = textSchema;

// Schema for specific sections (if you want to update only certain parts)
export const aboutSectionSchema = z.object({
  aboutUs: z
    .string()
    .trim()
    .min(1, "About us cannot be empty")
    .optional()
    .or(z.literal("")),
  achievements: z
    .string()
    .trim()
    .min(1, "Achievements cannot be empty")
    .optional()
    .or(z.literal("")),
  officeHours: z
    .string()
    .trim()
    .min(1, "Office hours cannot be empty")
    .optional()
    .or(z.literal("")),
});

export const contactSectionSchema = z.object({
  map: z
    .string()
    .trim()
    .url("Please enter a valid map URL")
    .optional()
    .or(z.literal("")),
  address: z
    .string()
    .trim()
    .min(1, "Address cannot be empty")
    .optional()
    .or(z.literal("")),
  contactPhone: z
    .string()
    .trim()
    .regex(/^[+]?[\d\s\-()]{10,}$/, "Please enter a valid phone number")
    .optional()
    .or(z.literal("")),
  contactEmail: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address")
    .optional()
    .or(z.literal("")),
});

export const socialMediaSchema = z.object({
  facebookLink: z
    .string()
    .trim()
    .url("Please enter a valid Facebook URL")
    .optional()
    .or(z.literal("")),
  youtubeLink: z
    .string()
    .trim()
    .url("Please enter a valid YouTube URL")
    .optional()
    .or(z.literal("")),
  instagramLink: z
    .string()
    .trim()
    .url("Please enter a valid Instagram URL")
    .optional()
    .or(z.literal("")),
  xLink: z
    .string()
    .trim()
    .url("Please enter a valid X/Twitter URL")
    .optional()
    .or(z.literal("")),
  githubLink: z
    .string()
    .trim()
    .url("Please enter a valid GitHub URL")
    .optional()
    .or(z.literal("")),
  linkedinLink: z
    .string()
    .trim()
    .url("Please enter a valid LinkedIn URL")
    .optional()
    .or(z.literal("")),
  tiktokLink: z
    .string()
    .trim()
    .url("Please enter a valid TikTok URL")
    .optional()
    .or(z.literal("")),
});

export const policiesSchema = z.object({
  termsOfService: z
    .string()
    .trim()
    .min(1, "Terms of service cannot be empty")
    .optional()
    .or(z.literal("")),
  privacyPolicy: z
    .string()
    .trim()
    .min(1, "Privacy policy cannot be empty")
    .optional()
    .or(z.literal("")),
  shippingPolicy: z
    .string()
    .trim()
    .min(1, "Shipping policy cannot be empty")
    .optional()
    .or(z.literal("")),
  returnPolicy: z
    .string()
    .trim()
    .min(1, "Return policy cannot be empty")
    .optional()
    .or(z.literal("")),
  refundPolicy: z
    .string()
    .trim()
    .min(1, "Refund policy cannot be empty")
    .optional()
    .or(z.literal("")),
  cookiePolicy: z
    .string()
    .trim()
    .min(1, "Cookie policy cannot be empty")
    .optional()
    .or(z.literal("")),
});

export const legalSectionSchema = z.object({
  shippingRestriction: z
    .string()
    .trim()
    .min(1, "Shipping restriction cannot be empty")
    .optional()
    .or(z.literal("")),
  disclaimer: z
    .string()
    .trim()
    .min(1, "Disclaimer cannot be empty")
    .optional()
    .or(z.literal("")),
});

// Type exports
export type TextInput = z.infer<typeof textSchema>;
export type UpdateTextInput = z.infer<typeof updateTextSchema>;
export type CreateTextInput = z.infer<typeof createTextSchema>;
export type AboutSectionInput = z.infer<typeof aboutSectionSchema>;
export type ContactSectionInput = z.infer<typeof contactSectionSchema>;
export type SocialMediaInput = z.infer<typeof socialMediaSchema>;
export type PoliciesInput = z.infer<typeof policiesSchema>;
export type LegalSectionInput = z.infer<typeof legalSectionSchema>;
