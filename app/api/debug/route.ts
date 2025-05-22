import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

// Hardcoded connection string as requested
const CONNECTION_STRING =
  "postgresql://neondb_owner:npg_DXVMKp6Oxh3Q@ep-bold-water-a55uvkzl-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"

export async function GET() {
  // Only allow debug API in development environment
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Debug API is only available in development mode" }, { status: 403 })
  }

  try {
    // Create a direct connection to the database
    const sql = neon(CONNECTION_STRING)

    // Check if the table exists
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `

    // Get all users from the database
    const users = await sql`SELECT * FROM user_details`

    return NextResponse.json({
      tables: tables.map((t) => t.table_name),
      userCount: users.length,
      users: users.map((u) => ({ email: u.email_id })),
    })
  } catch (error) {
    console.error("Debug API error:", error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
