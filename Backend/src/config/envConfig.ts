import dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.PORT || 5000;
export const DATABASE_URL = process.env.DATABASE_URL;
export const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
export const max_file_size:number = 10*1024*1024;
export const UPLOAD_FOLDER = "/public/images";