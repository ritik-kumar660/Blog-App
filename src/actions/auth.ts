"use server";

import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/lib/nodemailer";

// Helper to generate a 6-digit cryptographic-like OTP string
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

export async function registerUser(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!name || !email || !password) {
      return { error: "Please fill all fields." };
    }

    await connectToDatabase();

    const existingUser = await User.findOne({ email });

    const generatedOtp = generateOTP();
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    if (existingUser) {
      if (existingUser.isVerified) {
        return { error: "User already exists securely with this email." };
      } else {
        // If unverified, they are trapped in signup limbo. Regenerate the OTP for them!
        existingUser.verificationToken = generatedOtp;
        existingUser.verificationExpiry = expiry;
        
        // Technically they could change their password/name while in limbo, update it safely.
        existingUser.name = name;
        existingUser.password = await bcrypt.hash(password, 10);
        await existingUser.save();
      }
    } else {
       const hashedPassword = await bcrypt.hash(password, 10);
       await User.create({
          name,
          email,
          password: hashedPassword,
          isVerified: false,
          verificationToken: generatedOtp,
          verificationExpiry: expiry,
       });
    }

    // Attempt to transmit the OTP via NodeMailer
    const emailRes = await sendVerificationEmail(email, generatedOtp);
    if (!emailRes.success) {
      console.error(emailRes.error);
      return { error: "Failed to send verification email. Verify your .env SMTP credentials." };
    }

    // Successfully injected into DB and emailed! Instruct UI to slide to OTP component
    return { success: true, step: 'otp' };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to register user.";
    return { error: message };
  }
}

export async function verifyOTP(email: string, otp: string) {
  try {
    if (!email || !otp) return { error: "Invalid request parameters." };

    await connectToDatabase();
    
    // We request the token specifically since it might not be in the default projection
    const user = await User.findOne({ email });

    if (!user) {
      return { error: "User does not exist." };
    }

    if (user.isVerified) {
      return { error: "Email is already verified. You can log in." };
    }

    if (user.verificationToken !== otp) {
      return { error: "Invalid verification code." };
    }

    if (user.verificationExpiry && new Date() > new Date(user.verificationExpiry)) {
      return { error: "Verification code has expired. Please request a new one." };
    }

    // Success! Wipe tokens and authenticate
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationExpiry = undefined;
    await user.save();

    return { success: true };
  } catch (_error) {
    return { error: "Server error during verification." };
  }
}

export async function resendOTP(email: string) {
  try {
    if (!email) return { error: "Email missing." };
    await connectToDatabase();
    const user = await User.findOne({ email });

    if (!user) return { error: "User not found." };
    if (user.isVerified) return { error: "User already verified." };

    const generatedOtp = generateOTP();
    user.verificationToken = generatedOtp;
    user.verificationExpiry = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    const emailRes = await sendVerificationEmail(email, generatedOtp);
    if (!emailRes.success) return { error: "Failed to transmit email." };

    return { success: true, message: "A new OTP was successfully sent." };
  } catch {
    return { error: "Failed to resend." };
  }
}

export async function forgotPassword(email: string) {
  try {
    if (!email) return { error: "Email is required." };
    
    await connectToDatabase();
    const user = await User.findOne({ email });
    if (!user) return { error: "If an account exists with this email, you will receive a reset code." };

    const resetOtp = generateOTP();
    const expiry = new Date(Date.now() + 15 * 60 * 1000);

    user.resetPasswordToken = resetOtp;
    user.resetPasswordExpiry = expiry;
    await user.save();

    // Reusing verification email with generic OTP style OR use specific reset log
    // Better to use the specific reset one I just added:
    const { sendResetPasswordEmail } = await import("@/lib/nodemailer");
    await sendResetPasswordEmail(email, resetOtp);

    return { success: true };
  } catch {
    return { error: "Failed to process forgot password request." };
  }
}

export async function resetPassword(formData: FormData) {
  try {
    const email = formData.get("email") as string;
    const otp = formData.get("otp") as string;
    const password = formData.get("password") as string;

    if (!email || !otp || !password) return { error: "All fields are required." };

    await connectToDatabase();
    const user = await User.findOne({ email }).select("+password"); // Need to load password to check against if needed, or just overwrite
    
    if (!user) return { error: "Invalid request." };

    if (user.resetPasswordToken !== otp) {
      return { error: "Invalid or expired reset code." };
    }

    if (user.resetPasswordExpiry && new Date() > new Date(user.resetPasswordExpiry)) {
      return { error: "Reset code has expired." };
    }

    // Success - Hash and update
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    return { success: true };
  } catch {
    return { error: "Failed to reset password." };
  }
}

