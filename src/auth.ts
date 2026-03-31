import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

import { CredentialsSignin } from "next-auth";
import { DefaultSession } from "next-auth";

// Module augmentation
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      isBanned: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    role?: string;
    isBanned?: boolean;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID as string,
      clientSecret: process.env.GOOGLE_SECRET as string,
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new CredentialsSignin("Invalid credentials");
        }

        await connectToDatabase();

        const user = await User.findOne({ email: credentials.email }).select("+password");

        if (!user || !user.password) {
          throw new CredentialsSignin("Invalid credentials");
        }

        const isMatch = await bcrypt.compare(
          String(credentials.password),
          user.password
        );

        if (!isMatch) {
          throw new CredentialsSignin("Invalid credentials");
        }

        /*
        if (user.isBanned) {
          throw new Error("Account suspended. Please contact support.");
        }
        */

        if (!user.isVerified) {
          throw new Error("Email not verified. Please register again to securely verify your inbox.");
        }

        if (user.email === "ritikkumarharhar660@gmail.com" && user.role !== "admin") {
          user.role = "admin";
          await user.save();
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          isBanned: user.isBanned,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        await connectToDatabase();
        if (!user.email) return false;

        let existingUser = await User.findOne({ email: user.email });

        if (!existingUser) {
          existingUser = await User.create({
            name: user.name || "Unknown User",
            email: user.email || "",
            image: user.image || "",
            role: user.email === "ritikkumarharhar660@gmail.com" ? "admin" : "user",
            isVerified: true,
          });
        } else {
          if (existingUser.email === "ritikkumarharhar660@gmail.com" && existingUser.role !== "admin") {
            existingUser.role = "admin";
            await existingUser.save();
          }
        }

        user.id = existingUser._id.toString();
        user.image = existingUser.image || "";
        user.role = existingUser.role || "user";
        user.isBanned = existingUser.isBanned || false;
      }

      return true;
    },

    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.image = user.image;
        token.role = user.role || "user";
        token.isBanned = user.isBanned || false;
      }

      if (trigger === "update") {
        console.log("UPDATE TRIGGERED, fetching latest user profile...");
        await connectToDatabase();
        const updatedUser = await User.findById(token.id);
        if (updatedUser) {
          token.image = updatedUser.image;
          token.name = updatedUser.name;
          token.isBanned = updatedUser.isBanned;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.image = token.image as string;
        session.user.role = token.role as string;
        session.user.isBanned = token.isBanned as boolean;
      }

      return session;
    },
  },

  pages: {
    signIn: "/auth/login",
  },

  session: {
    strategy: "jwt",
  },
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
});
