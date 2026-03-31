import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { auth } from "@/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    
    const userId = session.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const hasSaved = user.savedPosts?.some(postId => postId.toString() === id);

    if (hasSaved) {
      // Unsave
      await User.findByIdAndUpdate(userId, {
        $pull: { savedPosts: id }
      });
      return NextResponse.json({ message: "Post unsaved", saved: false });
    } else {
      // Save
      await User.findByIdAndUpdate(userId, {
        $addToSet: { savedPosts: id }
      });
      return NextResponse.json({ message: "Post saved", saved: true });
    }
  } catch (error) {
    console.error("Save Post Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
