import dotenv from "dotenv";
dotenv.config();

export const DATABASE_URL = process.env.DATABASE_URL;
export const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY as string;
export const REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY as string;
export const PORT = process.env.PORT;
export const NODEMAILER_GMAIL = process.env.NODEMAILER_GMAIL;
export const NODEMAILER_GMAIL_PASSWORD = process.env.NODEMAILER_GMAIL_PASSWORD;
export const UPLOAD_FOLDER = process.env.UPLOAD_FOLDER;
//console.log(typeof process.env.UPLOAD_FOLDER); // "string"
export const MAX_PROFILE_PIC_SIZE = Number(process.env.MAX_PROFILE_PIC_SIZE) || 5*1024*1024;
export const MAX_PRODUCT_COVER_PIC_SIZE = Number(process.env.MAX_PROFILE_PIC_SIZE) || 5*1024*1024;
export const MAX_FILE_SIZE = Number(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024;
//console.log("the number",typeof MAX_PROFILE_PIC_SIZE); // "number"
export const NODE_ENV = process.env.NODE_ENV ?? "development";
export const OTP_EXPIRE_TIME = Number(process.env.OTP_EXPIRE_TIME) || 5*60*1000;
export const FRONTEND_URL  = process.env.FRONTEND_URL ;
