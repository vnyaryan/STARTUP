import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { updateDocumentStatus, type DocumentStatus } from "@/lib/document-utils"

export async function POST(request: Request) {
  // Get the current session
  const session = getSession()

  if (!session || !session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { documentName, status } = await request.json()

    if (!documentName || !status) {
      return NextResponse.json({ error: "Document name and status are required" }, { status: 400 })
    }

    // Validate status
    if (!["verified", "pending", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // Update document status
    const success = updateDocumentStatus(documentName, status as DocumentStatus)

    if (!success) {
      return NextResponse.json({ error: "Failed to update document status" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating document status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
