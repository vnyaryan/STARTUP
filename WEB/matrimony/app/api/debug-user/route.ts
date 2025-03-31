// Let's create a debug endpoint to check the stored user data

import { NextResponse } from "next/server"
import { getUserByEmail } from "@/lib/user-db"

export async function GET(request: Request) {
  // Get the email from the URL query parameters
  const url = new URL(request.url)
  const email = url.searchParams.get("email")

  if (!email) {
    return NextResponse.json({ error: "Email parameter is required" }, { status: 400 })
  }

  try {
    const user = await getUserByEmail(email)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Return user info with partial password hash for debugging
    return NextResponse.json({
      id: user.id,
      email: user.email,
      gender: user.gender,
      passwordHashPrefix: user.password.substring(0, 10) + "...",
      passwordHashLength: user.password.length,
      created_at: user.created_at,
    })
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

