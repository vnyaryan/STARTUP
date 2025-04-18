import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth"
import { executeQuery } from "@/lib/db"

export async function GET() {
  try {
    console.log("API: /api/auth/me called")
    const session = await getSessionUser()
    console.log("API: Session data:", JSON.stringify(session, null, 2))

    if (!session || !session.id) {
      console.log("API: No valid session found")
      return NextResponse.json({ user: null }, { status: 401 })
    }

    // Get user data from database
    const result = await executeQuery(
      "SELECT id, username, email, profile_image_url, role, gender, date_of_birth FROM users WHERE id = $1",
      [session.id],
    )

    console.log(`API: Query result row count: ${result.rowCount}`)

    if (result.rowCount === 0) {
      console.log("API: User not found in database")
      return NextResponse.json({ user: null }, { status: 401 })
    }

    const user = result.rows[0]
    console.log("API: User data retrieved:", JSON.stringify(user, null, 2))

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        gender: user.gender,
        dateOfBirth: user.date_of_birth,
        role: user.role || "user",
        profileImageUrl: user.profile_image_url || null,
      },
    })
  } catch (error) {
    console.error("API: Error getting current user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
