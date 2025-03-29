import { put } from "@vercel/blob";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { filename, contentType } = await request.json();

  const blob = await put(`profile-pictures/${filename}`, request.body, {
    access: "public",
    contentType,
  });

  return NextResponse.json({
    blobUrl: blob.url,
  });
}
