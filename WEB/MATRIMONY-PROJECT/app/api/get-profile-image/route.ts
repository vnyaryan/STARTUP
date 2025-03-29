
import { NextResponse } from "next/server";

let savedProfilePicUrl: string | null = null;

export async function GET() {
  return NextResponse.json({ profilePicUrl: savedProfilePicUrl });
}
