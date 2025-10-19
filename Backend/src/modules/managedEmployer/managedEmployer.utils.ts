import { NODEMAILER_GMAIL, NODEMAILER_GMAIL_PASSWORD } from "../../config/envConfig";
import ApiError from "../../errors/ApiError";
import nodemailer from "nodemailer";

export const sendCreateAccountEmail = async (
  email: string,
  name: string,
  tempPassword: string|undefined //! optional, if you want to send them a temporary password
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
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 30px 20px; border-radius: 10px;">
  <h1 style="text-align: center; color: #111111; font-family: 'Times New Roman', Times, serif; font-size: 30px; letter-spacing: 1px;">
    🎉 Welcome to the Team, ${name}!
  </h1>

  <div style="background-color: white; padding: 25px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);">
    <p style="font-size: 16px; color: #333; line-height: 1.6;">
      Dear <strong>${name}</strong>,<br><br>
      We’re thrilled to welcome you aboard as our newest team member! Your account has been successfully created by our admin team.
    </p>

    <p style="font-size: 16px; color: #333; line-height: 1.6;">
      You can now log in using your registered email: <strong>${email}</strong>
    </p>

    ${
      tempPassword
        ? `
        <div style="text-align: center; margin: 30px 0; padding: 15px; background-color: #111111; color: white; border-radius: 8px; font-size: 18px; font-weight: bold;">
          Temporary Password: <strong>${tempPassword}</strong>
        </div>
        <p style="text-align: center; font-size: 14px; color: #e10600;">
          Please change your password after your first login for security reasons.
        </p>`
        : ""
    }

    <p style="font-size: 16px; color: #333; line-height: 1.6; margin-top: 20px;">
      We’re excited to have you with us and can’t wait to see the amazing things you’ll accomplish. 
    </p>

    <p style="font-size: 16px; color: #333; margin-top: 20px;">
      Welcome again to the team! 💼<br>
      — The HR & Admin Team
    </p>
  </div>

  <p style="font-size: 12px; color: #666; margin-top: 10px; text-align: center;">
    This is an automated email. Please do not reply to this message.
  </p>
</div>
    `;

    const mailOptions = {
      from: NODEMAILER_GMAIL,
      to: email,
      subject: `Welcome to the Team, ${name}!`,
      html: emailContent,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`❌ Error sending Welcome Email to ${email}:`, error);
    throw new ApiError(500, "Unexpected error occurred during welcome email sending.");
  }
};
