import { query } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const token = url.searchParams.get("token")

    if (!token) {
      // Redirect to an error page instead of returning JSON
      return NextResponse.redirect(new URL("/verification-failed?error=missing-token", url.origin))
    }

    // Find user with this token
    const userResult = await query("SELECT * FROM users WHERE verification_token = $1", [token])

    if (userResult.rows.length === 0) {
      return NextResponse.redirect(new URL("/verification-failed?error=invalid-token", url.origin))
    }

    const user = userResult.rows[0]

    // Check if token is expired
    if (user.token_expiry && new Date(user.token_expiry) < new Date()) {
      return NextResponse.redirect(new URL("/verification-failed?error=expired-token", url.origin))
    }

    // Mark email as verified and clear token
    await query(
      "UPDATE users SET email_verified = true, verification_token = NULL, token_expiry = NULL WHERE id = $1",
      [user.id],
    )

    // Redirect to success page
    return NextResponse.redirect(new URL("/verification-success", url.origin))
  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.redirect(new URL("/verification-failed?error=server-error", url.origin))
  }
}

