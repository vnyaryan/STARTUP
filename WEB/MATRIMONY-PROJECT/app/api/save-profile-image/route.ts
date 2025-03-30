import { NextRequest, NextResponse } from "next/server";

// Placeholder for database or external storage.
let savedProfilePicUrl: string | null = null;

export async function POST(req: NextRequest) {
  try {
    const { profilePicUrl } = await req.json();

    // Validate the incoming profilePicUrl
    if (!profilePicUrl || typeof profilePicUrl !== "string") {
      return NextResponse.json(
        { success: false, message: "Invalid or missing profilePicUrl." },
        { status: 400 }
      );
    }

    // Save profile picture URL (this is a placeholder, replace with DB/storage logic)
    savedProfilePicUrl = profilePicUrl;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving profile image:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
