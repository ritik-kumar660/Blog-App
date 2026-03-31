import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Notification from "@/models/Notification";
import User from "@/models/User";
import Post from "@/models/Post";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const notifications = await Notification.find({ recipient: session.user.id })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate({ path: "sender", model: User, select: "name image" })
      .populate({ path: "post", model: Post, select: "title" });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Fetch Notifications Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    // Mark all as read
    await Notification.updateMany(
      { recipient: session.user.id, read: false },
      { $set: { read: true } }
    );

    return NextResponse.json({ message: "Notifications marked as read" }, { status: 200 });
  } catch (error) {
    console.error("Update Notifications Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
