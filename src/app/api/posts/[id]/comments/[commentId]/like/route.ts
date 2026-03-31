import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Comment from "@/models/Comment";
import { auth } from "@/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const { commentId } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    
    const comment = await Comment.findById(commentId);
    if (!comment) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const userId = session.user.id;
    
    const hasLiked = comment.likedBy?.includes(userId as any);

    if (hasLiked) {
      await Comment.findByIdAndUpdate(commentId, {
        $inc: { likes: -1 },
        $pull: { likedBy: userId }
      });
      return NextResponse.json({ message: "Unliked", liked: false }, { status: 200 });
    } else {
      await Comment.findByIdAndUpdate(commentId, {
        $inc: { likes: 1 },
        $push: { likedBy: userId }
      });
      return NextResponse.json({ message: "Liked", liked: true }, { status: 200 });
    }

  } catch (error) {
    console.error("Like Comment Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
