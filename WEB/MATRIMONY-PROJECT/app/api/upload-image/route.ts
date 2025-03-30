import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

export async function POST(request: NextRequest) {
  console.log("📩 /api/upload-image endpoint hit");

  try {
    const formData = await request.formData();

    const file = formData.get("file") as File | null;
    const filename = formData.get("filename") as string;
    const contentType = formData.get("contentType") as string;

    console.log("📄 Received file:", file?.name);
    console.log("📛 Filename:", filename);
    console.log("📦 Content-Type:", contentType);
    console.log("🔐 Blob token present:", !!process.env.BLOB_READ_WRITE_TOKEN);

    if (!file || !filename || !contentType) {
      console.warn("⚠️ Missing file/filename/contentType");
      return NextResponse.json(
        { error: "File, filename, and content type are required." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    console.log("📊 File buffer created, size:", buffer.length);

    const blob = await put(filename, buffer, {
      access: "public",
      contentType,
      token: process.env.BLOB_READ_WRITE_TOKEN!,
    });

    console.log("✅ Upload successful. Blob URL:", blob.url);

    return NextResponse.json({ blobUrl: blob.url }, { status: 200 });
  } catch (error: any) {
    console.error("❌ Vercel Blob upload error:", error.message, error);
    return NextResponse.json(
      { error: "Failed to upload file. Please try again." },
      { status: 500 }
    );
  }
}
