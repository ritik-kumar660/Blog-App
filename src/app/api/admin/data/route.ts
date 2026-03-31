import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Post from "@/models/Post";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();

    const users = await User.find().select("name email role createdAt isVerified isBanned").sort({ createdAt: -1 });
    const posts = await Post.find().select("title author createdAt published").populate({ path: "author", model: User, select: "name" }).sort({ createdAt: -1 });

    return NextResponse.json({ users, posts });
  } catch (error) {
    console.error("Admin Data Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
