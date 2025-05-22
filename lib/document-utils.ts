import fs from "fs"
import path from "path"

// Define the document status type
export type DocumentStatus = "verified" | "pending" | "rejected"

// Define the document verification data type
export type DocumentVerificationData = {
  [key: string]: DocumentStatus
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
