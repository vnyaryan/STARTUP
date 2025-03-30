import { NextRequest, NextResponse } from "next/server";
import { put } from '@vercel/blob';

export async function POST(request: NextRequest) {
  const { filename, contentType } = await request.json();

  const blob = await put(filename, null, { access: 'public', contentType });

  return NextResponse.json({
    uploadUrl: blob.url,  // Client uploads directly via PUT to this URL
    blobUrl: blob.url,    // Publicly accessible URL to render image
  });
}
