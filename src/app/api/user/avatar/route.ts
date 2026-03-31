import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { imageUrl } = await req.json();

        await connectToDatabase();

        const user = await User.findOneAndUpdate(
            { email: session.user.email },
            { image: imageUrl },
            { new: true }
        );

        return NextResponse.json({
            message: "Avatar updated",
            user,
        });

    } catch (error) {
        return NextResponse.json({ error: "Error updating avatar" }, { status: 500 });
    }
}
