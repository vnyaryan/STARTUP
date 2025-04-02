import { NextResponse } from "next/server"
import bcryptjs from "bcryptjs" // Using bcryptjs instead of bcrypt
import { query } from "@/lib/db"
import { createVerificationToken } from "@/lib/user-db"
import { sendVerificationEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password, gender } = body

    // Validate input
    if (!name || !email || !password || !gender) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await query("SELECT * FROM users WHERE email = $1", [email])

    if (existingUser.rows.length > 0) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10)

    // Create user with email_verified set to false
    const result = await query(
      `INSERT INTO users (name, email, password, email_verified, gender) 
       VALUES ($1, $2, $3, false, $4) RETURNING id`,
      [name, email, hashedPassword, gender],
    )

    const userId = result.rows[0].id

    // Generate verification token
    const verificationToken = await createVerificationToken(userId)

    // Send verification email
    await sendVerificationEmail(email, verificationToken)

    return NextResponse.json(
      {
        success: true,
        message: "User created. Please check your email to verify your account.",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "An error occurred during signup" }, { status: 500 })
  }
}

