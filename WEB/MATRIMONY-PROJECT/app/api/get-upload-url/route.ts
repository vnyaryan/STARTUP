import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

export async function POST(request: NextRequest) {
  try {
    const { filename, contentType } = await request.json();

    // Correct and updated usage
    const blob = await put(filename, null, {
      access: 'public',
      contentType,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return NextResponse.json({
      uploadUrl: blob.url,
      blobUrl: blob.url,
    });
  } catch (error: any) {
    console.error("Detailed Vercel Blob Error:", error.message, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
