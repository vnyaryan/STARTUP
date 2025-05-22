import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import fs from "fs"
import path from "path"

// Define the document status type
export type DocumentStatus = "verified" | "pending" | "rejected"

// Define the document verification data type
export type DocumentVerificationData = {
  [key: string]: DocumentStatus
}

export async function GET() {
  // Get the current session
  const session = getSession()

  if (!session || !session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // In a real application, you would fetch this data from a database
    // based on the user's ID or email. For this example, we'll read from a JSON file.

    // Read the JSON file
    const filePath = path.join(process.cwd(), "public", "data", "document-verification.json")
    const fileData = fs.readFileSync(filePath, "utf8")
    const documentData: DocumentVerificationData = JSON.parse(fileData)

    // Format the document names for display (convert snake_case to title case)
    const formattedData = Object.entries(documentData).map(([key, status]) => {
      // Convert snake_case to title case (e.g., "aadhaard_card" to "Aadhaard Card")
      const formattedName = key
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
        .replace("Aadhaard", "AADHAAR") // Special case for AADHAAR
        .replace("Pan", "PAN") // Special case for PAN
        .replace("Passport", "PASSPORT") // Special case for PASSPORT

      return {
        name: formattedName,
        status: status,
      }
    })

    return NextResponse.json(formattedData)
  } catch (error) {
    console.error("Error fetching document verification data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
