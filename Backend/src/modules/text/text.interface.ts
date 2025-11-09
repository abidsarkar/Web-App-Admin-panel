import { email } from 'zod';
//change in working interface file
import { Document } from "mongoose";

export interface IText extends Document {
  //about information
  aboutUs?: string;
  achievements?: string;
  officeHours?: string;
  //contact to team
  map?: string;
  address?: string;
  contactPhone?: string;
  contactEmail?: string;
  //social media
  facebookLink?: string;
  youtubeLink?: string;
  instagramLink?: string;
  xLink?: string;
  githubLink?: string;
  linkedinLink?: string;
  tiktokLink?: string;
  //terms of services and policy
  termsOfService?: string;
  privacyPolicy?: string;
  shippingPolicy?: string;
  returnPolicy?: string;
  refundPolicy?: string;
  cookiePolicy?: string;
  // restriction info
  shippingRestriction?: string;
  disclaimer?: string;
  lastUpdatedBy?:{
    id:string;
    role:string;
    email:string;
    updatedAt:Date;
  }
  createdAt?: Date;
  updatedAt?: Date;
}
