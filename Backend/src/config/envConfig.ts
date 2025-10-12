import dotenv from "dotenv";
dotenv.config();

export const DATABASE_URL = process.env.DATABASE_URL;
export const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
export const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN;
export const REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY;
export const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN;
export const PORT = process.env.PORT;
export const NODEMAILER_GMAIL = process.env.NODEMAILER_GMAIL;
export const NODEMAILER_GMAIL_PASSWORD = process.env.NODEMAILER_GMAIL_PASSWORD;
export const UPLOAD_FOLDER = process.env.UPLOAD_FOLDER;
//console.log(typeof process.env.UPLOAD_FOLDER); // "string"
export const MAX_PROFILE_PIC_SIZE = Number(process.env.MAX_PROFILE_PIC_SIZE);
//console.log("the number",typeof MAX_PROFILE_PIC_SIZE); // "number"
