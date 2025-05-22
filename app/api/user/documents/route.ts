import { NextResponse } from "next/server"
import { getSession, getUserDetails } from "@/lib/session"
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
    // Get user details to retrieve the username
    const userDetails = await getUserDetails(session.email)

    if (!userDetails || !userDetails.username) {
      console.warn("Username not found for user:", session.email)
      return NextResponse.json({ error: "Username not found" }, { status: 404 })
    }

    const username = userDetails.username
    console.log(`Fetching document verification data for user: ${username}`)

    // Construct the path to the user-specific JSON file
    const dataDir = path.join(process.cwd(), "public", "data")
    const userFilePath = path.join(dataDir, `${username}-document-verification.json`)

    let documentData: DocumentVerificationData = {}

    // Check if the user-specific file exists
    if (fs.existsSync(userFilePath)) {
      try {
        // Read the user-specific JSON file
        const fileData = fs.readFileSync(userFilePath, "utf8")
        documentData = JSON.parse(fileData)
        console.log(`Successfully read document data from ${username}-document-verification.json`)
      } catch (fileError) {
        console.error(`Error reading user-specific document file for ${username}:`, fileError)
        return NextResponse.json({ error: "Error reading document verification data" }, { status: 500 })
      }
    } else {
      // User-specific file not found, try to use the default file
      console.log(`User-specific document file not found for ${username}, trying default file`)

      const defaultFilePath = path.join(dataDir, "document-verification.json")

      if (fs.existsSync(defaultFilePath)) {
        try {
          // Read the default JSON file
          const defaultFileData = fs.readFileSync(defaultFilePath, "utf8")
          documentData = JSON.parse(defaultFileData)
          console.log("Using default document verification file")

          // Create a user-specific file with the default data for future use
          try {
            // Ensure the data directory exists
            if (!fs.existsSync(dataDir)) {
              fs.mkdirSync(dataDir, { recursive: true })
            }

            // Write the default data to a new user-specific file
            fs.writeFileSync(userFilePath, defaultFileData)
            console.log(`Created new user-specific document file: ${username}-document-verification.json`)
          } catch (writeError) {
            console.error(`Error creating user-specific document file for ${username}:`, writeError)
            // Continue with the default data even if we couldn't create the user file
          }
        } catch (defaultError) {
          console.error("Error reading default document verification file:", defaultError)
          return NextResponse.json({ error: "Document verification data not available" }, { status: 404 })
        }
      } else {
        console.error("Default document verification file not found")
        return NextResponse.json({ error: "Document verification data not available" }, { status: 404 })
      }
    }

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
