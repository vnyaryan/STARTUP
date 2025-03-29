import { generateUploadUrl } from "@vercel/blob";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { filename, contentType } = await request.json();

  // 1. Generate a secure presigned upload URL
  const { url, token } = await generateUploadUrl();

  // 2. Construct the full upload URL with parameters
  const uploadUrl = `${url}?token=${token}&filename=${encodeURIComponent(filename)}&contentType=${encodeURIComponent(contentType)}`;

  // 3. Return uploadUrl (to PUT the file) and blobUrl (to view it after upload)
  return NextResponse.json({
    uploadUrl,
    blobUrl: url,
  });
}
