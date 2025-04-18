import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth"
import { seedVerificationStatuses } from "@/app/actions/seed-verifications"

export async function POST(request: Request) {
  try {
    // Verify the user is authenticated and is an admin
    const session = await getSessionUser()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has role property and it's admin, otherwise allow if it's the first user (ID 1)
    const isAdmin = session.role === "admin" || session.id === 1

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the user ID from the request body
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Seed verification statuses for the user
    const result = await seedVerificationStatuses(userId)

    if (result.success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
  } catch (error) {
    console.error("Error seeding verification statuses:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
