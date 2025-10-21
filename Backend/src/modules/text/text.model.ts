// src/models/user/user.model.ts
import mongoose, { Schema } from "mongoose";
import { IText } from "./text.interface";

const textSchema = new Schema<IText>(
  {
    // About Information Section
    aboutUs: {
      type: String,
      trim: true,
      default: "good developer",
    },
    achievements: {
      type: String,
      trim: true,
      default: "achievements",
    },
    officeHours: {
      type: String,
      trim: true,
      default: "10am-6pm",
    },

    // Contact Information Section
    map: {
      type: String,
      trim: true,
      default: "map", // Could be Google Maps embed URL or coordinates
    },
    address: {
      type: String,
      trim: true,
      default: "address",
    },
    contactPhone: {
      type: String,
      trim: true,
      default: "contactPhone",
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: "contactEmail",
     
    },

    // Social Media Links Section
    facebookLink: {
      type: String,
      trim: true,
      default: "facebookLink",
    },
    youtubeLink: {
      type: String,
      trim: true,
      default: "youtubeLink",
    },
    instagramLink: {
      type: String,
      trim: true,
      default: "instagramLink",
    },
    xLink: {
      type: String,
      trim: true,
      default: "xLink",
    },
    githubLink: {
      type: String,
      trim: true,
      default: "githubLink",
    },
    linkedinLink: {
      type: String,
      trim: true,
      default: "linkedinLink",
    },
    tiktokLink: {
      type: String,
      trim: true,
      default: "tiktokLink",
    },

    // Terms and Policies Section
    termsOfService: {
      type: String,
      trim: true,
      default: "termsOfService",
    },
    privacyPolicy: {
      // Fixed field name from termsOfPolicy
      type: String,
      trim: true,
      default: "privacyPolicy",
    },
    shippingPolicy: {
      type: String,
      trim: true,
      default: "shippingPolicy",
    },
    returnPolicy: {
      type: String,
      trim: true,
      default: "returnPolicy",
    },
    refundPolicy: {
      type: String,
      trim: true,
      default: "refundPolicy",
    },
    cookiePolicy: {
      type: String,
      trim: true,
      default: "cookiePolicy",
    },

    // Restriction and Legal Section
    shippingRestriction: {
      type: String,
      trim: true,
      default: "outside BD",
    },
    disclaimer: {
      type: String,
      trim: true,
      default: "disclaimer",
    },
  },
  {
    timestamps: true, // This will automatically add createdAt and updatedAt
    versionKey: false, // Disable the __v field
  }
);

export const TextModel = mongoose.model<IText>("Text", textSchema);
