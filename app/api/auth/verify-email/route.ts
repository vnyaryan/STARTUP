import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { createToken } from "@/lib/auth"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    // Get the token from the URL
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.redirect(new URL("/verification-error", request.url))
    }

    // Find the user with this verification token
    const result = await executeQuery(
      `SELECT id, username, email, role, verification_token, verification_token_expires 
       FROM users 
       WHERE verification_token = $1`,
      [token],
    )

    if (result.rowCount === 0) {
      return NextResponse.redirect(new URL("/verification-error", request.url))
    }

    const user = result.rows[0]

    // Check if token is expired
    const now = new Date()
    const tokenExpires = new Date(user.verification_token_expires)

    if (now > tokenExpires) {
      return NextResponse.redirect(new URL("/verification-expired", request.url))
    }

    // Mark email as verified and clear the token
    await executeQuery(
      `UPDATE users 
       SET email_verified = TRUE, 
           verification_token = NULL, 
           verification_token_expires = NULL,
           updated_at = NOW()
       WHERE id = $1`,
      [user.id],
    )

    // Create a JWT token and log the user in
    const authToken = await createToken({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role || "user",
    })

    // Set the token in a cookie
    const response = NextResponse.redirect(new URL("/verification-success", request.url))

    cookies().set({
      name: "auth_token",
      value: authToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    })

    return response
  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.redirect(new URL("/verification-error", request.url))
  }
}
