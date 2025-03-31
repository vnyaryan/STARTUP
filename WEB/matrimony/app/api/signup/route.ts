import { type NextRequest, NextResponse } from "next/server"
import { createUser, getUserByEmail } from "@/lib/user-db"
import type { UserSignupData } from "@/types/user"
import { signToken, setAuthCookie } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, gender, dob } = body as UserSignupData

    // Validate input
    if (!email || !password || !gender || !dob) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email)

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 })
    }

    // Create new user
    const user = await createUser({ email, password, gender, dob })

    // Create JWT token
    const token = await signToken({
      userId: user.id,
      email: user.email,
      gender: user.gender,
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

