// app/api/get-upload-url/route.ts
import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

export async function POST(request: NextRequest) {
  try {
    const { filename, contentType } = await request.json();

    // Correct usage of Vercel Blob's put function
    const blob = await put(filename, null, { access: 'public', contentType });

    return NextResponse.json({
      uploadUrl: blob.url,  // Direct PUT upload URL
      blobUrl: blob.url,    // URL for accessing the uploaded file
    });
  } catch (error: any) {
    console.error("Error generating upload URL:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
