import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth"
import { executeQuery } from "@/lib/db"

export async function POST(request: Request) {
  try {
    // Verify the requester is an admin
    const session = await getSessionUser()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has admin role or is the first user (ID 1)
    const isAdmin = session.role === "admin" || session.id === 1

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the user ID to promote from request body
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Update the user's role to admin
    await executeQuery("UPDATE users SET role = 'admin' WHERE id = $1", [userId])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error promoting user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
