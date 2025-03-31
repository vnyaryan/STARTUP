import { NextResponse, type NextRequest } from "next/server"
import bcrypt from "bcryptjs"
import { getUserByEmail } from "@/lib/user-db"
import { query } from "@/lib/db"
import { signToken, setAuthCookie } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, gender, dob } = body

    // Validate input
    if (!email || !password || !gender || !dob) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email)

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 })
    }

    // Hash password with 10 rounds (same as in login verification)
    console.log("Hashing password for signup")
    const hashedPassword = await bcrypt.hash(password, 10)
    console.log("Password hash created:", hashedPassword.substring(0, 10) + "...")

    // Create new user
    const result = await query(
      `INSERT INTO users (email, password, gender, dob) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, email, gender, dob, created_at`,
      [email, hashedPassword, gender, dob],
    )

    const user = result.rows[0]

    // Create JWT token
    const token = await signToken({
      userId: user.id,
      email: user.email,
    })

    // Create response
    const response = NextResponse.json(
      {
        message: "User created successfully",
        user,
      },
      { status: 201 },
    )

    // Set auth cookie
    return setAuthCookie(response, token)
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

