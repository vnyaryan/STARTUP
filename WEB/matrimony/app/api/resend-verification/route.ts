import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { createVerificationToken } from "@/lib/user-db"
import { sendVerificationEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Check if user exists
    const userResult = await db.query("SELECT id, email_verified FROM users WHERE email = $1", [email])

    if (userResult.rows.length === 0) {
      // Don't reveal that the user doesn't exist for security reasons
      return NextResponse.json(
        { success: true, message: "If your email exists in our system, a verification link has been sent." },
        { status: 200 },
      )
    }

    const user = userResult.rows[0]

    // If already verified, no need to send again
    if (user.email_verified) {
      return NextResponse.json(
        { success: true, message: "Your email is already verified. Please login." },
        { status: 200 },
      )
    }

    // Generate new verification token
    const verificationToken = await createVerificationToken(user.id)

    // Send verification email
    await sendVerificationEmail(email, verificationToken)

    return NextResponse.json(
      { success: true, message: "Verification email sent. Please check your inbox." },
      { status: 200 },
    )
  } catch (error) {
    console.error("Resend verification error:", error)
    return NextResponse.json({ error: "An error occurred while resending verification email" }, { status: 500 })
  }
}

