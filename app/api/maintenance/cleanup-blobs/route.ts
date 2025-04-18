import { type NextRequest, NextResponse } from "next/server"
import { cleanupOrphanedBlobs } from "@/lib/blob-utils"
import { getSessionUser } from "@/lib/auth"

// This endpoint should be called by a cron job or scheduled task
export async function POST(request: NextRequest) {
  try {
    // Verify the request is from an authenticated admin user
    const session = await getSessionUser()

    // If no session, return unauthorized
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has role property and it's admin, otherwise allow if it's the first user (ID 1)
    const isAdmin = session.role === "admin" || session.id === 1

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await cleanupOrphanedBlobs()

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Cleaned up ${result.deletedCount} orphaned blobs`,
      })
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
  } catch (error) {
    console.error("Cleanup task error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Add a GET endpoint for scheduled tasks that doesn't require authentication
// This is designed to be called by Vercel Cron Jobs which don't support authentication
export async function GET(request: NextRequest) {
  // Verify the request is coming from Vercel's internal systems
  // Vercel Cron adds this header to requests
  const isVercelCron = request.headers.get("x-vercel-cron") === "true"

  // For additional security, we can check if the request is coming from a Vercel IP
  const forwardedFor = request.headers.get("x-forwarded-for") || ""

  if (!isVercelCron) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const result = await cleanupOrphanedBlobs()

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Cleaned up ${result.deletedCount} orphaned blobs`,
      })
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
  } catch (error) {
    console.error("Cleanup task error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
