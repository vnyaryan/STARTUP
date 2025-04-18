import { NextResponse } from "next/server"
import { setupImageTables } from "@/app/actions/db-setup"

export async function GET() {
  try {
    const result = await setupImageTables()

    if (result.success) {
      return NextResponse.json({ message: "Database tables set up successfully" })
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
  } catch (error) {
    console.error("Setup error:", error)
    return NextResponse.json({ error: "Failed to set up database tables" }, { status: 500 })
  }
}
