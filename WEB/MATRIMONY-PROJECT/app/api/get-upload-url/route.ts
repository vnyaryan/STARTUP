import { put } from "@vercel/blob";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { filename, contentType } = await request.json();

  const blob = await put(filename, null, { access: "public", contentType });

  return NextResponse.json({
    uploadUrl: blob.uploadUrl,
    blobUrl: blob.url,
  });
}
