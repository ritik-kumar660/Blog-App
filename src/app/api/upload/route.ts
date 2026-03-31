import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
    try {
        const data = await req.formData();
        const file = data.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file" }, { status: 400 });
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Cloudinary
        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader
                .upload_stream(
                    { folder: "blog-app" },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                )
                .end(buffer);
        });

        return NextResponse.json({
            url: (result as any).secure_url,
        });

    } catch (error: any) {
        console.error("CLOUDINARY API ERROR:", error);
        return NextResponse.json({ error: error.message || "Upload failed internally" }, { status: 500 });
    }
}
