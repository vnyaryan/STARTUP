
import { NextRequest, NextResponse } from "next/server";

let savedProfilePicUrl: string | null = null;

export async function POST(req: NextRequest) {
  const { profilePicUrl } = await req.json();
  savedProfilePicUrl = profilePicUrl;
  return NextResponse.json({ success: true });
}
