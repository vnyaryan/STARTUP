// save-profile-image/route.ts
import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function POST(req: NextRequest) {
  try {
    const { userId, profilePicUrl } = await req.json();

    if (!profilePicUrl || typeof profilePicUrl !== "string") {
      return NextResponse.json(
        { success: false, message: "Invalid or missing profilePicUrl." },
        { status: 400 }
      );
    }

    await sql`
      UPDATE users SET profile_pic_url = ${profilePicUrl}
      WHERE id = ${userId};
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving profile image:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
