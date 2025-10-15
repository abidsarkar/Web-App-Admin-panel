import { Response } from "express";
export const sendCookie = (
  res: Response,
  token: string,
  cookieName: string = "refreshToken"
) => {
  res.cookie(cookieName, token, {
    httpOnly: true, // Prevents JavaScript access to the cookie
    secure: process.env.NODE_ENV === "production", // Only set cookie over HTTPS in production
    sameSite: "strict", // Helps prevent CSRF attacks
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days 
  }); // Set the cookie
};