import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { comparePasswords, createToken, setAuthCookie } from "@/lib/auth"
import { query } from "@/lib/db"

// Validation schema
const LoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
})

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const validationResult = LoginSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validationResult.error.format(),
        },
        { status: 400 },
      )
    }

    const { username, password } = validationResult.data

    // Find user by username
    const result = await query("SELECT * FROM users WHERE username = $1", [username])

    const user = result.rows[0]

    // Check if user exists
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid username or password",
        },
        { status: 401 },
      )
    }

    // Check if email is verified
    if (!user.email_verified) {
      return NextResponse.json(
        {
          success: false,
          error: "Please verify your email before logging in",
        },
        { status: 403 },
      )
    }

    // Verify password
    const isPasswordValid = await comparePasswords(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid username or password",
        },
        { status: 401 },
      )
    }

    // Generate JWT token
    const token = await createToken({
      id: user.id,
      username: user.username,
    })

    // Create response
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    })

    // Set auth cookie
    setAuthCookie(token, response)

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "An error occurred during login",
        details: process.env.NODE_ENV === "development" ? (error as Error).message : undefined,
      },
      { status: 500 },
    )
  }
}

