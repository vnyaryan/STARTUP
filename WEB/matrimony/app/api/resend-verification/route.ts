import { query } from "@/lib/db"
import { sendVerificationEmail } from "@/lib/email"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return Response.json({ error: "Email is required" }, { status: 400 })
    }

    // Check if user exists and is not already verified
    const userResult = await query("SELECT * FROM users WHERE email = $1", [email])

    if (userResult.rows.length === 0) {
      // Don't reveal that the user doesn't exist for security reasons
      return Response.json({
        success: true,
        message: "If your email exists in our system, a verification email has been sent.",
      })
    }

    const user = userResult.rows[0]

    if (user.email_verified) {
      return Response.json({
        success: true,
        message: "Your email is already verified. You can now log in.",
      })
    }

    // Generate new verification token (UUID format)
    const verificationToken = uuidv4()
    const tokenExpiry = new Date()
    tokenExpiry.setHours(tokenExpiry.getHours() + 24) // Token valid for 24 hours

    // Update user with new token
    await query("UPDATE users SET verification_token = $1, token_expiry = $2 WHERE id = $3", [
      verificationToken,
      tokenExpiry,
      user.id,
    ])

    // Send verification email
    await sendVerificationEmail(email, verificationToken)

    return Response.json({
      success: true,
      message: "Verification email sent. Please check your inbox.",
    })
  } catch (error) {
    console.error("Resend verification error:", error)
    return Response.json({ error: "An error occurred while sending the verification email" }, { status: 500 })
  }
}

