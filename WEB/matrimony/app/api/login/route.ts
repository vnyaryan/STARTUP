import { NextResponse } from "next/server"
import { verifyUser } from "@/lib/user-db"
import { signToken, setAuthCookie } from "@/lib/auth"
import type { UserLoginData } from "@/types/user"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body as UserLoginData

    console.log("Login attempt for:", email)

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Verify user credentials
    const user = await verifyUser(email, password)

    if (!user) {
      console.log("Authentication failed for:", email)
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    console.log("Authentication successful for:", email)

    // Create JWT token
    const token = await signToken({
      userId: user.id,
      email: user.email,
      gender: user.gender,
    })

    // Create response
    const response = NextResponse.json({
      message: "Login successful",
      user,
    })

    // Set auth cookie
    return setAuthCookie(response, token)
  } catch (error) {
    console.error("Error during login:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

