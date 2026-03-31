import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Notification from "@/models/Notification";
import mongoose from "mongoose";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: targetUserId } = await params;
    const currentUserId = session.user.id;

    if (targetUserId === currentUserId) {
      return NextResponse.json({ error: "You cannot follow yourself" }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    await connectToDatabase();

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser || !currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const targetObjectId = new mongoose.Types.ObjectId(targetUserId);
    const currentObjectId = new mongoose.Types.ObjectId(currentUserId);

    const isFollowing = currentUser.following?.some(id => id.toString() === targetUserId);

    if (isFollowing) {
      // Unfollow
      await User.findByIdAndUpdate(currentUserId, {
        $pull: { following: targetObjectId },
      });
      await User.findByIdAndUpdate(targetUserId, {
        $pull: { followers: currentObjectId },
      });
      return NextResponse.json({ message: "Unfollowed successfully", isFollowing: false }, { status: 200 });
    } else {
      // Follow
      await User.findByIdAndUpdate(currentUserId, {
        $push: { following: targetObjectId },
      });
      await User.findByIdAndUpdate(targetUserId, {
        $push: { followers: currentObjectId },
      });

      // Create Notification
      await Notification.create({
        recipient: targetObjectId,
        sender: currentObjectId,
        type: "follow",
      });

      return NextResponse.json({ message: "Followed successfully", isFollowing: true }, { status: 200 });
    }

  } catch (error) {
    console.error("Follow API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
