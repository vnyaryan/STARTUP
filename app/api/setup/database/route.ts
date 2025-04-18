import { NextResponse } from "next/server"
import { setupImageTables } from "@/app/actions/db-setup"

export async function GET() {
  try {
    // Run both setup functions
    await setupImageTables()

    return NextResponse.json({ message: "Database setup completed successfully" })
  } catch (error) {
    console.error("Database setup error:", error)
    return NextResponse.json({ error: "Failed to set up database" }, { status: 500 })
  }
}
