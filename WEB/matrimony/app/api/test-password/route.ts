import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    const testPassword = "password123"

    // Generate a hash
    const hash = await bcrypt.hash(testPassword, 10)
    console.log("Generated hash:", hash)

    // Verify the hash
    const isMatch = await bcrypt.compare(testPassword, hash)
    console.log("Verification result:", isMatch)

    return NextResponse.json({
      success: true,
      hash,
      isMatch,
      message: "Password hashing test completed",
    })
  } catch (error) {
    console.error("Password test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 },
    )
  }
}

