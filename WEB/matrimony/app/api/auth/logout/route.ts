import { type NextRequest, NextResponse } from "next/server"
import { removeAuthCookie } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    // Create response
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    })

    // Remove auth cookie
    removeAuthCookie(response)

    return response
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "An error occurred during logout",
        details: process.env.NODE_ENV === "development" ? (error as Error).message : undefined,
      },
      { status: 500 },
    )
  }
}

