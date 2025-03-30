// get-profile-image/route.ts
import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");

    const result = await sql`
      SELECT profile_pic_url FROM users WHERE id = ${userId};
    `;

    const profilePicUrl = result[0]?.profile_pic_url;

    if (!profilePicUrl) {
      return NextResponse.json({ profilePicUrl: null }, { status: 404 });
    }

    return NextResponse.json({ profilePicUrl });
  } catch (error) {
    console.error("Error fetching profile image:", error);
    return NextResponse.json(
      { profilePicUrl: null, error: "Failed to fetch profile image" },
      { status: 500 }
    );
  }
}
