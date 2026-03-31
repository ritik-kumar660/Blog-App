import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Post from "@/models/Post";
import { auth } from "@/auth";

// GET /api/posts
// Fetches posts belonging to the signed-in user
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const draftsOnly = searchParams.get("drafts") === "true";
    
    await connectToDatabase();

    const posts = await Post.find({
      author: session.user.id,
      published: !draftsOnly, // If draftsOnly is true, published is false
    }).sort({ updatedAt: -1 });

    return NextResponse.json(posts);

  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/posts
// Creates a new post or draft
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, content, tags, published } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    await connectToDatabase();

    // Convert comma-separated tags to array and trim whitespace
    const parsedTags = typeof tags === "string" 
      ? tags.split(",").map(t => t.trim()).filter(Boolean) 
      : [];

    const rawText = content.replace(/<[^>]+>/g, "");
    const readTime = Math.max(1, Math.ceil(rawText.split(/\s+/).length / 200));

    const newPost = await Post.create({
      title,
      content,
      tags: parsedTags,
      published: published || false,
      author: session.user.id,
      readTime,
    });

    return NextResponse.json(newPost, { status: 201 });

  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
