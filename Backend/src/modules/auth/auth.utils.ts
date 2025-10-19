import { Response } from "express";
import { EmployerInfo } from "./auth.model";
import { NODEMAILER_GMAIL, NODEMAILER_GMAIL_PASSWORD, OTP_EXPIRE_TIME } from "../../config/envConfig";
import ApiError from "../../errors/ApiError";
import nodemailer from "nodemailer"
import { NODE_ENV } from "../../config/envConfig";

export const sendRefreshCookie = (
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
export const sendAccessCookie = (
  res: Response,
  token: string,
  cookieName: string = "accessToken"
) => {
  res.cookie(cookieName, token, {
    httpOnly: true, // Prevents JavaScript access to the cookie
    secure: process.env.NODE_ENV === "production", // Only set cookie over HTTPS in production
    sameSite: "strict", // Helps prevent CSRF attacks
    maxAge: 60 * 60 * 1000, // 1 hour 
  }); // Set the cookie
};
export const sendForgotPasswordCookie = (
  res: Response,
  token: string,
  cookieName: string = "forgotPasswordToken"
) => {
  res.cookie(cookieName, token, {
    httpOnly: true, // Prevents JavaScript access to the cookie
    secure: NODE_ENV === "production", // Only set cookie over HTTPS in production
    sameSite: "strict", // Helps prevent CSRF attacks
    maxAge: 5 * 60 * 1000, // 5 minutes
  }); // Set the cookie
};
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const saveOTP = async (email: string, otp: string): Promise<void> => {
  await EmployerInfo.findOneAndUpdate(
    { email },
    { otp, otpExpiresAt: new Date(Date.now() + 5 * 60 * 1000) },
    { upsert: true, new: true }
  );
};

export const otpExpireTime = async (): Promise<Date> => {
  const start = Date.now(); // Get the current timestamp (in milliseconds)
  const otpExpiresAt = new Date(start + OTP_EXPIRE_TIME);
  return otpExpiresAt; // Return the expiration time as a Date object
};
//forgot password
export const sendForgotPasswordOTPEmail = async (
  email: string,
  otp: string,
  name: string
): Promise<void> => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      secure: true,
      auth: {
        user: NODEMAILER_GMAIL,
        pass: NODEMAILER_GMAIL_PASSWORD,
      },
    });

    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f2f9fc; padding: 30px 20px; border-radius: 10px;">
        <h1 style="text-align: center; color: #1a3d6d; font-family: 'Times New Roman', Times, serif; font-size: 32px; letter-spacing: 2px;">
          Remote Jobs
        </h1>
        <div style="background-color: white; padding: 25px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);">
          <h2 style="color:#111111; text-align: center; font-size: 24px; font-weight: bold;">Hello ${name}!</h2>
          <p style="font-size: 16px; color: #333; text-align: center; line-height: 1.6;">
            We received a request to reset your password. Use the OTP below to complete the process.
          </p>
          
          <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #111111; color: white; border-radius: 8px; font-size: 24px; font-weight: bold;">
            <h3 style="margin: 0; color: #FFFFFF">Your OTP is: <strong>${otp}</strong></h3>
          </div>
          
          <p style="text-align: center; color: #e10600; font-weight: bold; font-size: 14px; margin-top: 20px;">
            This OTP will expire in 5 minutes.
          </p>
          <p style="font-size: 16px; color: #333; text-align: center; line-height: 1.6; margin-top: 20px;">
            If you did not request this, please ignore this email.
          </p>
          <p style="font-size: 16px; color: #333; text-align: center; margin-top: 20px;">
            Regards,<br>Remote Jobs Team
          </p>
        </div>
        
        <p style="font-size: 12px; color: #666; margin-top: 10px; text-align: center;">
          If you're having trouble copying the OTP, please try again.
        </p>
      </div>
    `;

    const mailOptions = {
      from: process.env.Nodemailer_GMAIL, // Sender's email address
      to: email, // Recipient's email address
      subject: "Forgot Password OTP for Remote Jobs", // Subject line
      html: emailContent, // Email body content as HTML
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`Error sending OTP email to ${email}:`, error);
    throw new ApiError(500, "Unexpected error occurred during email sending.");
  }
};

export const sendResendOTPEmail = async (
  email: string,
  otp: string,
  name: string
): Promise<void> => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      secure: true,
      auth: {
        user: NODEMAILER_GMAIL,
        pass: NODEMAILER_GMAIL_PASSWORD,
      },
    });

    const emailContent = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f2f9fc; padding: 30px 20px; border-radius: 10px;">
   <h1 style="text-align: center; color: #111111; font-family: 'Times New Roman', Times, serif; font-size: 32px; letter-spacing: 2px;">
    Bienvenue
  </h1>
  
  <div style="background-color: white; padding: 25px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);">
    <h2 style="color: #111111; text-align: center; font-size: 24px; font-weight: bold;">Hello ${name}!</h2>
    <p style="font-size: 16px; color: #333; text-align: center; line-height: 1.6;">You are receiving this email because we received a password reset request for your account.</p>
    
    <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #111111; color: white; border-radius: 8px; font-size: 24px; font-weight: bold;">
      <h3 style="margin: 0; color: #FFFFFF">Your OTP is: <strong>${otp}</strong></h3>
    </div>
    
    <p style="text-align: center; color: #e10600; font-weight: bold; font-size: 14px; margin-top: 20px;">This OTP will expire in 3 minutes.</p>
    <p style="font-size: 16px; color: #333; text-align: center; line-height: 1.6; margin-top: 20px;">If you did not request a password reset, no further action is required.</p>
    <p style="font-size: 16px; color: #333; text-align: center; margin-top: 20px;">Regards,<br></p>
  </div>
  
  <p style="font-size: 12px; color: #666; margin-top: 10px; text-align: center;">If you're having trouble copying the OTP, please try again.</p>
</div>


    `;

    const mailOptions = {
      from: "nodemailerapptest@gmail.com",
      to: email,
      subject: "Reset Password OTP",
      html: emailContent,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`Error sending OTP email to ${email}:`, error);
    throw new ApiError(500, "Unexpected error occurred during email sending.");
  }
};