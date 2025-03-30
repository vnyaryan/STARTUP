import { NextRequest, NextResponse } from "next/server";
import { generateUploadUrl } from "@vercel/blob/client";

export async function POST(request: NextRequest) {
  try {
    const { filename, contentType } = await request.json();

    // Correct method: generate a presigned upload URL
    const uploadData = await generateUploadUrl(filename, {
      access: 'public',
      contentType,
    });

    return NextResponse.json({
      uploadUrl: uploadData.url,   // URL for client-side PUT request
      blobUrl: uploadData.url,     // URL to view the file afterward
    });
  } catch (error: any) {
    console.error("Detailed Vercel Blob Error:", error.message, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
