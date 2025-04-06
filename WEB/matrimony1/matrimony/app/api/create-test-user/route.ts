import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const testEmail = "test@example.com"
    const testPassword = "password123"
    const hashedPassword = await bcrypt.hash(testPassword, 10)

    // Check if user exists
    const existingUser = await query("SELECT * FROM users WHERE email = $1", [testEmail])

    if (existingUser.rows.length > 0) {
      // Update existing test user
      await query("UPDATE users SET password = $1 WHERE email = $2", [hashedPassword, testEmail])
    } else {
      // Create new test user
      await query(
        `INSERT INTO users (email, password, gender, dob) 
         VALUES ($1, $2, $3, $4)`,
        [testEmail, hashedPassword, "other", "2000-01-01"],
      )
    }

    return NextResponse.json({
      success: true,
      message: "Test user created/updated",
      email: testEmail,
      password: testPassword, // Only showing this for testing purposes!
      hashedPassword,
    })
  } catch (error) {
    console.error("Error creating test user:", error)
    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 },
    )
  }
}

