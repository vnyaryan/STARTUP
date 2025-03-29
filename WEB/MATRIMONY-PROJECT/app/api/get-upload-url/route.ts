
import { put } from "@vercel/blob";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { filename, contentType } = await request.json();

  const { url, uploadUrl } = await put(`profile-pictures/${filename}`, {
    access: "public",
    contentType,
  });

  return NextResponse.json({
    uploadUrl,
    blobUrl: url,
  });
}
