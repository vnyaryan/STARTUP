import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "Verification token is required",
        },
        { status: 400 },
      )
    }

    // Find user by verification token
    const result = await query("SELECT * FROM users WHERE verification_token = $1", [token])

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid or expired verification token",
        },
        { status: 400 },
      )
    }

    const user = result.rows[0]

    // Update user's email_verified status
    await query("UPDATE users SET email_verified = true, verification_token = NULL WHERE id = $1", [user.id])

    return NextResponse.json({
      success: true,
      message: "Email verified successfully",
    })
  } catch (error) {
    console.error("Verification error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "An error occurred during verification",
        details: process.env.NODE_ENV === "development" ? (error as Error).message : undefined,
      },
      { status: 500 },
    )
  }
}

