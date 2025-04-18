"use server"
import { setupVerificationTables, updateVerificationStatus } from "./verification-setup"

export async function seedVerificationStatuses(userId: string) {
  try {
    // Ensure verification tables exist
    await setupVerificationTables()

    // Define verification types and possible statuses
    const verificationTypes = ["address", "education", "employment", "aadhaar", "criminal_record", "passport"]

    const statuses = ["verified", "pending", "failed", "not_verified"]

    // Seed verification statuses for the user
    for (const type of verificationTypes) {
      // Generate a random status for testing
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]

      // Add notes for some verifications
      let notes = null
      if (randomStatus === "failed") {
        notes = "Document verification failed. Please resubmit."
      } else if (randomStatus === "pending") {
        notes = "Document under review. This may take 2-3 business days."
      }

      // Update the verification status
      await updateVerificationStatus(userId, type, randomStatus, null, notes)
    }

    return { success: true }
  } catch (error) {
    console.error("Error seeding verification statuses:", error)
    return {
      success: false,
      error: "Failed to seed verification statuses",
    }
  }
}
