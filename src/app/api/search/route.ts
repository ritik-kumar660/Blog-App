import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Post from "@/models/Post";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json({ posts: [], users: [] }, { status: 200 });
    }

    await connectToDatabase();

    const regex = new RegExp(query, "i");

    // Search posts (title, content text approximation, tags)
    const posts = await Post.find({
      published: true,
      isAuthorBanned: { $ne: true },
      $or: [
        { title: { $regex: regex } },
        { tags: { $in: [regex] } },
      ]
    })
    .sort({ createdAt: -1 })
    .limit(20)
    .populate({ path: "author", model: User, select: "name image" });

    // Search users (name, email)
    const users = await User.find({
      isBanned: { $ne: true },
      $or: [
        { name: { $regex: regex } },
        { email: { $regex: regex } },
      ]
    })
    .select("name image bio followers")
    .limit(10);

    return NextResponse.json({ posts, users }, { status: 200 });

  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
