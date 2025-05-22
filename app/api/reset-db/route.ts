import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

// Hardcoded connection string as requested
const CONNECTION_STRING =
  "postgresql://neondb_owner:npg_DXVMKp6Oxh3Q@ep-bold-water-a55uvkzl-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"

export async function POST() {
  // Only allow database reset in development environment
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Database reset is only available in development mode" }, { status: 403 })
  }

  try {
    // Create a direct connection to the database
    const sql = neon(CONNECTION_STRING)

    // Drop the table if it exists
    await sql`DROP TABLE IF EXISTS user_details`

    // Recreate the table
    await sql`
      CREATE TABLE user_details (
        email_id VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        date_of_birth DATE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    return NextResponse.json({ message: "Database reset successfully" })
  } catch (error) {
    console.error("Error resetting database:", error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
