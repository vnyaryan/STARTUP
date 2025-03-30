import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

export async function POST(request: NextRequest) {
  try {
    const { filename, contentType } = await request.json();

    // Correct: Use { token: true } to generate a client-side upload URL
    const blob = await put(filename, { access: 'public', contentType, token: true });

    return NextResponse.json({
      uploadUrl: blob.url, // use this URL on client side to PUT the file
      blobUrl: blob.url,   // same URL to access uploaded file
    });
  } catch (error: any) {
    console.error("Detailed Vercel Blob Error:", error.message, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
