// Let's create a test endpoint to check if bcrypt is working correctly

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

    // Try with a wrong password
    const wrongMatch = await bcrypt.compare("wrongpassword", hash)

    return NextResponse.json({
      success: true,
      hash,
      isMatch,
      wrongMatch,
      hashFormat: hash.substring(0, 7),
      hashLength: hash.length,
    })
  } catch (error) {
    console.error("Bcrypt test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 },
    )
  }
}

