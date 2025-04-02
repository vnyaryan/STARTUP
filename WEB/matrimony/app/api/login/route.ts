import { query } from "@/lib/db"
import { compare } from "bcryptjs"
import { sign } from "jsonwebtoken"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return Response.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Find user by email
    const userResult = await query("SELECT * FROM users WHERE email = $1", [email])

    if (userResult.rows.length === 0) {
      return Response.json({ error: "Invalid email or password" }, { status: 401 })
    }

    const user = userResult.rows[0]

    // Check if email is verified
    if (!user.email_verified) {
      return Response.json(
        {
          error: "Email not verified",
          needsVerification: true,
        },
        { status: 403 },
      )
    }

    // Verify password
    const passwordValid = await compare(password, user.password)

    if (!passwordValid) {
      return Response.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Create JWT token
    const token = sign(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
      },
      process.env.JWT_SECRET || "fallback-secret-key-for-development-only",
      { expiresIn: "7d" },
    )

    // Set cookie
    cookies().set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: "strict",
    })

    // Return user data (excluding sensitive information)
    return Response.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        gender: user.gender,
        dob: user.dob,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return Response.json({ error: "An error occurred during login" }, { status: 500 })
  }
}

