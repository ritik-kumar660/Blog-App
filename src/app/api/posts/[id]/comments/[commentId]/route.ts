import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Comment from "@/models/Comment";
import Post from "@/models/Post";
import { auth } from "@/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const { id, commentId } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content } = await req.json();
    if (!content || typeof content !== "string" || content.trim() === "") {
      return NextResponse.json({ error: "Comment content is required" }, { status: 400 });
    }

    await connectToDatabase();

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    if (comment.author.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    comment.content = content.trim();
    await comment.save();

    return NextResponse.json(comment, { status: 200 });
  } catch (error) {
    console.error("Edit Comment Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const { id, commentId } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Allow comment author OR post author OR admin to delete
    const post = await Post.findById(id);
    const isCommentAuthor = comment.author.toString() === session.user.id;
    const isPostAuthor = post?.author?.toString() === session.user.id;
    // Assume session.user.role exists if admin check needed, default to true for comment creator
    const isAdmin = (session.user as any)?.role === "admin";

    if (!isCommentAuthor && !isPostAuthor && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete the comment itself
    await Comment.findByIdAndDelete(commentId);

    // If it's a top-level, it might have replies. delete them.
    if (!comment.parentComment) {
      await Comment.deleteMany({ parentComment: commentId });
    } else {
      // It's a reply, remove it from parent's replies array
      await Comment.findByIdAndUpdate(comment.parentComment, {
        $pull: { replies: commentId }
      });
    }

    await Post.findByIdAndUpdate(id, { $inc: { commentCount: -1 } });

    return NextResponse.json({ message: "Comment deleted" }, { status: 200 });
  } catch (error) {
    console.error("Delete Comment Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
