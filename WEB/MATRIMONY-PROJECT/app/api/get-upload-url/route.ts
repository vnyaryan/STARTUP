import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

export async function POST(request: NextRequest) {
  try {
    const { filename, contentType } = await request.json();

    // Corrected usage clearly shown
    const blob = await put(filename, null, { access: 'public', contentType, token: true });

    return NextResponse.json({
      uploadUrl: blob.url, // URL for frontend to upload the file directly
      blobUrl: blob.url,   // URL to view the file after upload
    });
  } catch (error: any) {
    console.error("Detailed Vercel Blob Error:", error.message, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
