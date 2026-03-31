import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Comment from "@/models/Comment";
import Post from "@/models/Post";
import { auth } from "@/auth";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const { commentId } = await params;

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    // 1. Find the exact comment to guarantee it exists and belongs to the requesting user
    const comment = await Comment.findOne({ _id: commentId, author: session.user.id });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found or unauthorized to delete" }, { status: 404 });
    }

    // 2. Remove the comment explicitly
    await Comment.findByIdAndDelete(comment._id);

    // 3. Atomically decrement the Parent Post's comment metric
    await Post.findByIdAndUpdate(comment.post, { $inc: { commentCount: -1 } });

    return NextResponse.json({ message: "Comment deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Delete Comment Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
