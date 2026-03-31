import nodemailer from "nodemailer";

export const sendVerificationEmail = async (to: string, code: string) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: "Verify your email for Ritik Blog",
      html: `
        <div style="max-w: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 40px; border-radius: 10px;">
          <h2 style="color: #333; text-align: center;">Welcome to Ritik Blog!</h2>
          <p style="color: #555; font-size: 16px; line-height: 1.5; text-align: center;">
            Thank you for registering. To complete your signup and verify your email address, please use the following one-time password (OTP):
          </p>
          <div style="background-color: #ffffff; border: 2px dashed #cccccc; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center;">
            <p style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #111; margin: 0;">${code}</p>
          </div>
          <p style="color: #777; font-size: 14px; text-align: center;">
            This code will expire in 15 minutes. If you did not request this verification, please ignore this email.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error: any) {
    console.error("Nodemailer error:", error);
    return { success: false, error: error.message };
  }
};

export const sendResetPasswordEmail = async (to: string, code: string) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: "Password Reset OTP for Ritik Blog",
      html: `
        <div style="max-w: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 40px; border-radius: 10px;">
          <h2 style="color: #333; text-align: center;">Reset Your Password</h2>
          <p style="color: #555; font-size: 16px; line-height: 1.5; text-align: center;">
            You requested a password reset for your Ritik Blog account. Use the following code to proceed:
          </p>
          <div style="background-color: #ffffff; border: 2px dashed #3b82f6; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center;">
            <p style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #3b82f6; margin: 0;">${code}</p>
          </div>
          <p style="color: #777; font-size: 14px; text-align: center;">
            This code will expire in 15 minutes. If you did not request this, please change your security settings immediately.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error: any) {
    console.error("Nodemailer error:", error);
    return { success: false, error: error.message };
  }
};
