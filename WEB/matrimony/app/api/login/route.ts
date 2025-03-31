import { NextResponse } from "next/server"
import bcrypt from "bcryptjs" // Make sure we're using bcryptjs
import { getUserByEmail } from "@/lib/user-db" // Import from user-db, not data

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Find user
    const user = await getUserByEmail(email)

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    console.log("User found, attempting password verification")

    // TEMPORARY: For testing, you can uncomment this to bypass password verification
    // const passwordMatch = true;

    // Normal password verification
    const passwordMatch = await bcrypt.compare(password, user.password)
    console.log("Password verification result:", passwordMatch)

    if (!passwordMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Remove password from user object
    const { password: _, ...safeUser } = user

    return NextResponse.json({
      message: "Login successful",
      user: safeUser,
    })
  } catch (error) {
    console.error("Error during login:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

