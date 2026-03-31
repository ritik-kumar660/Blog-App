import mongoose, { Schema, Document, models, model } from "mongoose";

// TypeScript Interface
export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  image?: string;
  bio?: string;
  socialLinks?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
  savedPosts?: mongoose.Types.ObjectId[];
  followers: mongoose.Types.ObjectId[];
  following: mongoose.Types.ObjectId[];
  role: "user" | "admin";
  isVerified: boolean;
  isBanned: boolean;
  verificationToken?: string;
  verificationExpiry?: Date;
  resetPasswordToken?: string;
  resetPasswordExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Schema
const UserSchema: Schema<IUser> = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      select: false, // 🔐 hidden by default
    },

    image: {
      type: String,
      default: "", // 🔥 Cloudinary URL will be stored here
    },

    bio: {
      type: String,
      default: "",
      maxlength: 200,
    },

    socialLinks: {
      github: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      twitter: { type: String, default: "" },
    },

    savedPosts: [{
      type: Schema.Types.ObjectId,
      ref: "Post"
    }],

    followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: Schema.Types.ObjectId, ref: "User" }],

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isBanned: {
      type: Boolean,
      default: false,
    },

    verificationToken: {
      type: String,
    },

    verificationExpiry: {
      type: Date,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpiry: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent model overwrite in Next.js (VERY IMPORTANT ⚠️)
if (models.User) {
  delete models.User;
}
const User = model<IUser>("User", UserSchema);

export default User;