import { NextResponse } from "next/server"
import { sendVerificationEmail } from "@/lib/email"

export async function GET() {
  try {
    // Only enable this in development
    if (process.env.NODE_ENV !== "development") {
      return NextResponse.json({ error: "This endpoint is only available in development" }, { status: 403 })
    }

    // Send a test email
    const result = await sendVerificationEmail(
      "test@example.com", // Replace with your email for testing
      "test-token-123456",
    )

    if (!result.success) {
      return NextResponse.json({ error: "Failed to send test email", details: result.error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully",
      data: result.data,
    })
  } catch (error) {
    console.error("Test email error:", error)
    return NextResponse.json({ error: "An error occurred while sending test email" }, { status: 500 })
  }
}

