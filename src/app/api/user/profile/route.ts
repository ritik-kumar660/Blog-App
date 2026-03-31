import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    
    // We explicitly select the fields we built in the User model to prevent sending sensitive data like hashed passwords
    const user = await User.findById(session.user.id).select(
      "name email image bio socialLinks role createdAt"
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("GET Profile Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, bio, socialLinks } = await req.json();

    await connectToDatabase();

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Only update these safe textual fields. Avatar is still handled specifically by /api/user/avatar!
    if (name !== undefined) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (socialLinks !== undefined) {
      user.socialLinks = {
        github: socialLinks.github !== undefined ? socialLinks.github : user.socialLinks?.github || "",
        linkedin: socialLinks.linkedin !== undefined ? socialLinks.linkedin : user.socialLinks?.linkedin || "",
        twitter: socialLinks.twitter !== undefined ? socialLinks.twitter : user.socialLinks?.twitter || ""
      };
    }

    await user.save();

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("PUT Profile Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
