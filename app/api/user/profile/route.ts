import { NextResponse } from "next/server"
import { getSession, getUserDetails } from "@/lib/session"

export async function GET() {
  // Get the current session
  const session = getSession()

  if (!session || !session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get user details from the database
    const userDetails = await getUserDetails(session.email)

    if (!userDetails) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Return user details
    return NextResponse.json(userDetails)
  } catch (error) {
    console.error("Error fetching user details:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
