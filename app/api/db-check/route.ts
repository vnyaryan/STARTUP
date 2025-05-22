import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

// Hardcoded connection string as requested
const CONNECTION_STRING =
  "postgresql://neondb_owner:npg_DXVMKp6Oxh3Q@ep-bold-water-a55uvkzl-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"

export async function GET() {
  try {
    // Create a fresh connection for this test using the hardcoded connection string
    const testSql = neon(CONNECTION_STRING)

    // Test basic connectivity
    const connectionTest = await testSql`SELECT 1 as connection_test`

    // Extract database name from connection string
    const dbNameMatch = CONNECTION_STRING.match(/\/([^/?]+)(\?|$)/)
    const dbName = dbNameMatch ? dbNameMatch[1] : "unknown"

    // Get database version
    const versionResult = await testSql`SELECT version()`
    const dbVersion = versionResult[0]?.version || "Unknown"

    // Check if the table exists
    const tableCheck = await testSql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'user_details'
      ) as table_exists
    `

    // Get table structure if it exists
    let tableColumns = []
    if (tableCheck[0]?.table_exists) {
      tableColumns = await testSql`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'user_details'
        ORDER BY ordinal_position
      `
    }

    // Get user count if table exists
    let userCount = 0
    let emailList = []

    if (tableCheck[0]?.table_exists) {
      const countResult = await testSql`SELECT COUNT(*) as count FROM user_details`
      userCount = Number.parseInt(countResult[0]?.count) || 0

      // Get email list (limited to 10 for security)
      if (userCount > 0) {
        const emails = await testSql`
          SELECT email_id FROM user_details 
          ORDER BY created_at DESC 
          LIMIT 10
        `
        emailList = emails.map((user) => user.email_id)
      }
    }

    return NextResponse.json({
      success: true,
      connected: connectionTest[0]?.connection_test === 1,
      databaseName: dbName,
      databaseVersion: dbVersion,
      tableName: "user_details",
      tableExists: tableCheck[0]?.table_exists,
      tableColumns: tableColumns.map((col) => ({ name: col.column_name, type: col.data_type })),
      userCount,
      recentEmails: emailList,
    })
  } catch (error) {
    console.error("Database check error:", error)
    return NextResponse.json({
      success: false,
      connected: false,
      error: String(error),
    })
  }
}
