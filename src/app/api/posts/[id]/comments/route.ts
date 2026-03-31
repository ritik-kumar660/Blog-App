import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Comment from "@/models/Comment";
import Post from "@/models/Post";
import User from "@/models/User";
import Notification from "@/models/Notification";
import { auth } from "@/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();

    // Fetch top-level comments and populate their replies
    const comments = await Comment.find({ post: id, parentComment: null, isAuthorBanned: { $ne: true } })
      .populate({ path: "author", model: User, select: "name image role" })
      .populate({
        path: "replies",
        model: Comment,
        populate: { path: "author", model: User, select: "name image role" },
        options: { sort: { createdAt: 1 } },
      })
      .sort({ createdAt: -1 });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Fetch Comments Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

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

    const { content, replyTo } = await req.json();

    if (!content || typeof content !== "string" || content.trim() === "") {
        return NextResponse.json({ error: "Comment content is required" }, { status: 400 });
    }

    await connectToDatabase();

    const post = await Post.findById(id);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Create the Comment securely bound to the User ID
    const newComment = await Comment.create({
      content: content.trim(),
      author: session.user.id,
      post: id,
      parentComment: replyTo || null,
    });

    if (replyTo) {
      // It's a reply. Push it to the parent comment's replies array
      const parentComment = await Comment.findByIdAndUpdate(
        replyTo,
        { $push: { replies: newComment._id } },
        { new: true }
      );
      
      // Notify parent comment author if they aren't the one replying
      if (parentComment && parentComment.author.toString() !== session.user.id) {
        await Notification.create({
          recipient: parentComment.author,
          sender: session.user.id,
          type: "comment",
          post: id,
        });
      }
    } else {
      // It's a top-level comment. Notify Post author
      if (post.author.toString() !== session.user.id) {
        await Notification.create({
          recipient: post.author,
          sender: session.user.id,
          type: "comment",
          post: id,
        });
      }
    }

    // Increment post comments count
    await Post.findByIdAndUpdate(id, { $inc: { commentCount: 1 } });

    await newComment.populate({ path: "author", model: User, select: "name image role" });

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error("Post Comment Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
