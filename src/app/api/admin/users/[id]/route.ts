import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Post from "@/models/Post";
import Comment from "@/models/Comment";
import { auth } from "@/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    // STRICT Admin check
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Admins cannot ban themselves
    if (session.user.id === id) {
      return NextResponse.json({ error: "You cannot ban your own admin account" }, { status: 400 });
    }

    await connectToDatabase();

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Toggle ban status
    const newStatus = !user.isBanned;
    user.isBanned = newStatus;
    await user.save();
    
    // Hide or Reveal their posts and comments
    await Post.updateMany({ author: id }, { isAuthorBanned: newStatus });
    await Comment.updateMany({ author: id }, { isAuthorBanned: newStatus });

    const message = newStatus ? "User banned and content hidden." : "User restored successfully.";

    return NextResponse.json({ message, isBanned: newStatus }, { status: 200 });
  } catch (error) {
    console.error("Admin Toggle Ban User Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
