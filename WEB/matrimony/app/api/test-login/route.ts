import { NextResponse } from "next/server"
import { getUserByEmail } from "@/lib/user-db"
import { signToken, setAuthCookie } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    console.log("Test login for:", email)

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Find user without password verification
    const user = await getUserByEmail(email)

    if (!user) {
      console.log("User not found:", email)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Create JWT token
    const token = await signToken({
      userId: user.id,
      email: user.email,
    })

    // Remove password from user object
    const { password: _, ...safeUser } = user

    // Create response
    const response = NextResponse.json({
      message: "Test login successful",
      user: safeUser,
    })

    // Set auth cookie
    return setAuthCookie(response, token)
  } catch (error) {
    console.error("Error during test login:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

