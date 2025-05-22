import fs from "fs"
import path from "path"

// Define the document status type
export type DocumentStatus = "verified" | "pending" | "rejected"

// Define the document verification data type
export type DocumentVerificationData = {
  [key: string]: DocumentStatus
}

// Enhanced formatting function for document names
export function formatDocumentName(key: string): string {
  // Convert snake_case to title case
  let formattedName = key
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")

  // Define capitalization rules for specific terms
  const capitalizationRules = {
    Aadhaar: "AADHAAR",
    Aadhaard: "AADHAAR", // Handle typo variations
    Pan: "PAN",
    Passport: "PASSPORT",
    Email: "EMAIL",
    Id: "ID",
    Kyc: "KYC",
    Otp: "OTP",
    Api: "API",
    Url: "URL",
    Pdf: "PDF",
    Jpg: "JPG",
    Png: "PNG",
    Gif: "GIF",
    Html: "HTML",
    Css: "CSS",
    Js: "JS",
    Json: "JSON",
    Xml: "XML",
    Sql: "SQL",
    Db: "DB",
    Ui: "UI",
    Ux: "UX",
  }

  // Apply capitalization rules
  Object.entries(capitalizationRules).forEach(([original, replacement]) => {
    // Use word boundaries to ensure we only replace complete words
    const regex = new RegExp(`\\b${original}\\b`, "gi")
    formattedName = formattedName.replace(regex, replacement)
  })

  return formattedName
}

// Function to read document verification data
export function readDocumentVerificationData(): DocumentVerificationData {
  try {
    const filePath = path.join(process.cwd(), "public", "data", "document-verification.json")
    const fileData = fs.readFileSync(filePath, "utf8")
    return JSON.parse(fileData)
  } catch (error) {
    console.error("Error reading document verification data:", error)
    return {}
  }
}

// Function to update document verification data
export function updateDocumentVerificationData(data: DocumentVerificationData): boolean {
  try {
    const filePath = path.join(process.cwd(), "public", "data", "document-verification.json")
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    console.error("Error updating document verification data:", error)
    return false
  }
}

// Function to update a single document's status
export function updateDocumentStatus(documentName: string, status: DocumentStatus): boolean {
  try {
    const data = readDocumentVerificationData()
    data[documentName] = status
    return updateDocumentVerificationData(data)
  } catch (error) {
    console.error("Error updating document status:", error)
    return false
  }
}
