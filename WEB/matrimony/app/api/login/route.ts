import { type NextRequest, NextResponse } from "next/server"
import { verifyUser } from "@/lib/user-db"
import { signToken, setAuthCookie } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Verify user
    const user = await verifyUser(email, password)

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

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

