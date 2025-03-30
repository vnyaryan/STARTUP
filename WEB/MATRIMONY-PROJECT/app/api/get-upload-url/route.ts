import { generateUploadUrl } from "@vercel/blob";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { filename, contentType } = await request.json();

  // Generate secure presigned upload URL
  const { url, token } = await generateUploadUrl();

  // Construct upload URL with required parameters
  const uploadUrl = new URL(url);
  uploadUrl.searchParams.set("token", token);
  uploadUrl.searchParams.set("filename", filename);
  uploadUrl.searchParams.set("contentType", contentType);

  // Return the uploadUrl for file upload (PUT method)
  // and the blobUrl to access/view the image
  return NextResponse.json({
    uploadUrl: uploadUrl.toString(),
    blobUrl: url,
  });
}