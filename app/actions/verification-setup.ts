"use server"

import { executeQuery } from "@/lib/db"

export async function setupVerificationTables() {
  try {
    // Create verification_status table if it doesn't exist
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS verification_status (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        verification_type VARCHAR(50) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'not_verified',
        verified_at TIMESTAMP WITH TIME ZONE,
        document_url TEXT,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, verification_type)
      )
    `)

    // Create index for faster lookups
    await executeQuery(`
      CREATE INDEX IF NOT EXISTS idx_verification_user_id ON verification_status(user_id)
    `)

    return { success: true }
  } catch (error) {
    console.error("Error setting up verification tables:", error)
    return {
      success: false,
      error: "Failed to set up verification tables",
    }
  }
}

// Function to get all verification statuses for a user
export async function getUserVerificationStatuses(userId: string) {
  try {
    // Ensure the verification table exists
    await setupVerificationTables()

    // Get all verification statuses for the user
    const result = await executeQuery(
      `SELECT verification_type, status, verified_at, document_url, notes
       FROM verification_status
       WHERE user_id = $1`,
      [userId],
    )

    // Create a map of verification types to their statuses
    const verificationMap = new Map()

    // Define all verification types we want to track
    const verificationTypes = ["address", "education", "employment", "aadhaar", "criminal_record", "passport"]

    // Initialize all verification types with "not_verified" status
    verificationTypes.forEach((type) => {
      verificationMap.set(type, {
        status: "not_verified",
        verifiedAt: null,
        documentUrl: null,
        notes: null,
      })
    })

    // Update with actual statuses from database
    result.rows.forEach((row) => {
      verificationMap.set(row.verification_type, {
        status: row.status,
        verifiedAt: row.verified_at,
        documentUrl: row.document_url,
        notes: row.notes,
      })
    })

    // Convert map to object for easier use in components
    const verifications = {}
    verificationMap.forEach((value, key) => {
      verifications[key] = value
    })

    return {
      success: true,
      verifications,
    }
  } catch (error) {
    console.error("Error getting user verification statuses:", error)
    return {
      success: false,
      error: "Failed to get verification statuses",
      verifications: {},
    }
  }
}

// Function to update a verification status
export async function updateVerificationStatus(
  userId: string,
  verificationType: string,
  status: string,
  documentUrl?: string,
  notes?: string,
) {
  try {
    // Ensure the verification table exists
    await setupVerificationTables()

    // Check if a record already exists
    const checkResult = await executeQuery(
      `SELECT id FROM verification_status 
       WHERE user_id = $1 AND verification_type = $2`,
      [userId, verificationType],
    )

    if (checkResult.rowCount > 0) {
      // Update existing record
      await executeQuery(
        `UPDATE verification_status 
         SET status = $1, 
             ${status === "verified" ? "verified_at = NOW()," : ""} 
             document_url = $2,
             notes = $3,
             updated_at = NOW()
         WHERE user_id = $4 AND verification_type = $5`,
        [status, documentUrl || null, notes || null, userId, verificationType],
      )
    } else {
      // Insert new record
      await executeQuery(
        `INSERT INTO verification_status 
         (user_id, verification_type, status, verified_at, document_url, notes)
         VALUES ($1, $2, $3, ${status === "verified" ? "NOW()" : "NULL"}, $4, $5)`,
        [userId, verificationType, status, documentUrl || null, notes || null],
      )
    }

    return { success: true }
  } catch (error) {
    console.error("Error updating verification status:", error)
    return {
      success: false,
      error: "Failed to update verification status",
    }
  }
}
