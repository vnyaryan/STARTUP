import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

// Hardcoded connection string as requested
const CONNECTION_STRING =
  "postgresql://neondb_owner:npg_DXVMKp6Oxh3Q@ep-bold-water-a55uvkzl-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"

export async function GET() {
  try {
    // Create a direct connection to the database
    const sql = neon(CONNECTION_STRING)

    // Check if the table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'user_details'
      ) as exists
    `

    if (!tableExists[0]?.exists) {
      // Create the table
      await sql`
        CREATE TABLE user_details (
          email_id VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          date_of_birth DATE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `
      return NextResponse.json({ message: "Database initialized successfully" })
    } else {
      return NextResponse.json({ message: "Database table already exists" })
    }
  } catch (error) {
    return NextResponse.json({ message: "An error occurred", error }, { status: 500 })
  }
}
