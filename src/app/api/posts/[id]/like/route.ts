import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Post from "@/models/Post";
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
    
    const post = await Post.findById(id);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const userId = session.user.id;
    const hasLiked = post.likedBy?.some(id => id.toString() === userId);

    if (hasLiked) {
      // Unlike
      await Post.findByIdAndUpdate(id, {
        $pull: { likedBy: userId },
        $inc: { likes: -1 }
      });
      return NextResponse.json({ message: "Post unliked", liked: false });
    } else {
      // Like
      await Post.findByIdAndUpdate(id, {
        $addToSet: { likedBy: userId },
        $inc: { likes: 1 }
      });
      return NextResponse.json({ message: "Post liked", liked: true });
    }
  } catch (error) {
    console.error("Like Post Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
