import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const file = formData.get("file") as File | null;
    const filename = formData.get("filename") as string;
    const contentType = formData.get("contentType") as string;

    if (!file || !filename || !contentType) {
      return NextResponse.json(
        { error: "File, filename, and content type are required." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const blob = await put(filename, buffer, {
      access: "public",
      contentType,
      token: process.env.BLOB_READ_WRITE_TOKEN!,
    });

    return NextResponse.json({ blobUrl: blob.url }, { status: 200 });
  } catch (error: any) {
    console.error("Vercel Blob upload error:", error.message, error);
    return NextResponse.json(
      { error: "Failed to upload file. Please try again." },
      { status: 500 }
    );
  }
}
