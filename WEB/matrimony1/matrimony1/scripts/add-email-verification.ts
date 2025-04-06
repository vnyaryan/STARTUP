import { db } from "../lib/db"

async function addEmailVerificationFields() {
  try {
    // Add email_verified column to users table
    await db.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false
    `)

    // Create verification_tokens table if it doesn't exist
    await db.query(`
      CREATE TABLE IF NOT EXISTS verification_tokens (
        user_id TEXT PRIMARY KEY,
        token TEXT NOT NULL,
        expires TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    console.log("Email verification fields added successfully")
  } catch (error) {
    console.error("Error adding email verification fields:", error)
  } finally {
    await db.end()
  }
}

// Run the migration
addEmailVerificationFields()

