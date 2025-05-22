import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

// Hardcoded connection string as requested
const CONNECTION_STRING =
  "postgresql://neondb_owner:npg_DXVMKp6Oxh3Q@ep-bold-water-a55uvkzl-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"

export async function GET() {
  try {
    // Create a fresh connection for this test
    const testSql = neon(CONNECTION_STRING)

    // Test basic query
    const result = await testSql`SELECT NOW() as time`

    // Test table existence
    const tableCheck = await testSql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'user_details'
      ) as exists
    `

    // Get user count if table exists
    let userCount = 0
    if (tableCheck[0]?.exists) {
      const countResult = await testSql`SELECT COUNT(*) as count FROM user_details`
      userCount = countResult[0]?.count || 0
    }

    // Get database name from connection string
    const dbNameMatch = CONNECTION_STRING.match(/\/([^?]+)/)
    const dbName = dbNameMatch ? dbNameMatch[1] : "unknown"

    return NextResponse.json({
      success: true,
      currentTime: result[0]?.time,
      tableExists: tableCheck[0]?.exists,
      userCount,
      dbName,
    })
  } catch (error) {
    console.error("SQL Test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: String(error),
        stack: process.env.NODE_ENV === "development" ? (error as Error).stack : undefined,
      },
      { status: 500 },
    )
  }
}
