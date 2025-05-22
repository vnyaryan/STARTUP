import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

// Hardcoded connection string as requested
const CONNECTION_STRING =
  "postgresql://neondb_owner:npg_DXVMKp6Oxh3Q@ep-bold-water-a55uvkzl-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"

export async function GET() {
  try {
    // Create a fresh connection to the database
    const directSql = neon(CONNECTION_STRING)

    // Test basic connectivity
    const connectionTest = await directSql`SELECT 1 as connection_test`

    // Check if the table exists
    const tableCheck = await directSql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'user_details'
      ) as table_exists
    `

    // Get table structure if it exists
    let tableStructure = []
    if (tableCheck[0]?.table_exists) {
      tableStructure = await directSql`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'user_details'
      `
    }

    // Check for any existing users
    let users = []
    if (tableCheck[0]?.table_exists) {
      try {
        users = await directSql`SELECT email_id FROM user_details`
      } catch (error) {
        users = [{ error: String(error) }]
      }
    }

    // Get database name from connection string
    const dbNameMatch = CONNECTION_STRING.match(/\/([^?]+)/)
    const dbName = dbNameMatch ? dbNameMatch[1] : "unknown"

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      database: {
        name: dbName,
        connectionTest: connectionTest[0]?.connection_test === 1 ? "success" : "failed",
        tableExists: tableCheck[0]?.table_exists,
        tableStructure,
      },
      users: users.map((u) => (typeof u.email_id === "string" ? u.email_id : u)),
      connectionString: {
        provided: true,
        // Show just the structure without exposing credentials
        structure: CONNECTION_STRING.replace(/\/\/.*?@/, "//[CREDENTIALS]@"),
      },
    })
  } catch (error) {
    console.error("Diagnostic error:", error)
    return NextResponse.json(
      {
        error: String(error),
        stack: process.env.NODE_ENV === "development" ? (error as Error).stack : undefined,
      },
      { status: 500 },
    )
  }
}
