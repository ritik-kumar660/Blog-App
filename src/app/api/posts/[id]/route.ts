import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Post from "@/models/Post";
import { auth } from "@/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();
    
    // Using populate to expand author details in case frontend needs it (e.g. trending page)
    const post = await Post.findById(id).populate("author", "name image");

    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    return NextResponse.json(post);
  } catch (error) {
    console.error("Fetch Post Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, content, tags, published } = await req.json();

    await connectToDatabase();

    // Ensure the post actually belongs to the user trying to edit it!
    const existingPost = await Post.findOne({ _id: id, author: session.user.id });

    if (!existingPost) {
      return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
    }

    const parsedTags = typeof tags === "string" 
      ? tags.split(",").map((t: string) => t.trim()).filter(Boolean) 
      : tags || existingPost.tags;

    existingPost.title = title || existingPost.title;
    existingPost.content = content || existingPost.content;
    existingPost.tags = parsedTags;
    
    // Recalculate read time
    const rawText = existingPost.content.replace(/<[^>]+>/g, "");
    existingPost.readTime = Math.max(1, Math.ceil(rawText.split(/\s+/).length / 200));

    if (typeof published !== "undefined") {
      existingPost.published = published;
    }

    await existingPost.save();

    return NextResponse.json(existingPost, { status: 200 });
  } catch (error) {
    console.error("Update Post Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
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

    // Verify ownership or admin and delete
    const post = await Post.findById(id);
    if (!post) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const isAuthor = post.author.toString() === session.user.id;
    const isAdmin = (session.user as any)?.role === "admin";

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await Post.findByIdAndDelete(id);

    return NextResponse.json({ message: "Post deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Delete Post Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
