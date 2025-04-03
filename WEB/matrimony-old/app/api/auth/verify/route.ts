import { query } from "@/lib/db"
import { sendWelcomeEmail } from "@/lib/email"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const token = url.searchParams.get("token")

    if (!token) {
      return Response.json(
        {
          success: false,
          error: "Verification token is required",
        },
        { status: 400 },
      )
    }

    console.log("Verifying token:", token)

    // Find user by verification token
    const result = await query("SELECT * FROM users WHERE verification_token = $1", [token])

    console.log("User query result:", result.rows.length > 0 ? "User found" : "No user found")

    if (result.rows.length === 0) {
      return Response.json(
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
    console.log("User verified successfully:", user.username)

    // Send welcome email
    try {
      await sendWelcomeEmail(user.email, user.username)
      console.log("Welcome email sent to:", user.email)
    } catch (emailError) {
      console.error("Error sending welcome email:", emailError)
      // Continue even if welcome email fails
    }

    return Response.json({
      success: true,
      message: "Email verified successfully",
    })
  } catch (error) {
    console.error("Verification error:", error)
    return Response.json(
      {
        success: false,
        error: "An error occurred during verification",
        details: process.env.NODE_ENV === "development" ? (error as Error).message : undefined,
      },
      { status: 500 },
    )
  }
}

