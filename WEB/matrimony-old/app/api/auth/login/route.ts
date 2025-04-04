import { z } from "zod"
import { comparePasswords, createToken } from "@/lib/auth"
import { query } from "@/lib/db"

// Validation schema
const LoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
})

export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body = await request.json()
    console.log("Login attempt for username:", body.username)

    const validationResult = LoginSchema.safeParse(body)

    if (!validationResult.success) {
      console.log("Login validation failed:", validationResult.error.format())
      return Response.json(
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
    console.log("User found:", result.rows.length > 0)

    const user = result.rows[0]

    // Check if user exists
    if (!user) {
      console.log("User not found")
      return Response.json(
        {
          success: false,
          error: "Invalid username or password",
        },
        { status: 401 },
      )
    }

    // Check if email is verified
    console.log("Email verified:", user.email_verified)
    if (!user.email_verified) {
      return Response.json(
        {
          success: false,
          error: "Please verify your email before logging in",
        },
        { status: 403 },
      )
    }

    // Verify password
    const isPasswordValid = await comparePasswords(password, user.password)
    console.log("Password valid:", isPasswordValid)

    if (!isPasswordValid) {
      return Response.json(
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

    // Create response with cookie
    const response = Response.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    })

    // Set cookie using headers
    const cookieValue = `auth_token=${token}; Path=/; HttpOnly; Max-Age=${60 * 60 * 24}; SameSite=Lax`
    response.headers.set("Set-Cookie", cookieValue)
    console.log("Login successful for:", user.username)

    return response
  } catch (error) {
    console.error("Login error:", error)
    return Response.json(
      {
        success: false,
        error: "An error occurred during login",
        details: process.env.NODE_ENV === "development" ? (error as Error).message : undefined,
      },
      { status: 500 },
    )
  }
}

