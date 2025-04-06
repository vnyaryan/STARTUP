import { randomBytes } from "crypto"
import { query } from "./db"

// Get a user by email
export async function getUserByEmail(email: string) {
  const result = await query("SELECT * FROM users WHERE email = $1", [email])
  return result.rows.length > 0 ? result.rows[0] : null
}

// Generate a random verification token
export function generateVerificationToken(): string {
  return randomBytes(32).toString("hex")
}

// Create a verification token for a user
export async function createVerificationToken(userId: string): Promise<string> {
  const token = generateVerificationToken()
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now

  await query(
    `INSERT INTO verification_tokens (user_id, token, expires) 
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id) DO UPDATE 
     SET token = $2, expires = $3`,
    [userId, token, expires],
  )

  return token
}

// Verify a token and mark user as verified
export async function verifyEmail(token: string): Promise<boolean> {
  // First, find the token and check if it's valid
  const result = await query(
    `SELECT user_id FROM verification_tokens 
     WHERE token = $1 AND expires > NOW()`,
    [token],
  )

  if (result.rows.length === 0) {
    return false // Token not found or expired
  }

  const userId = result.rows[0].user_id

  // Mark the user as verified
  await query(`UPDATE users SET email_verified = true WHERE id = $1`, [userId])

  // Delete the used token
  await query(`DELETE FROM verification_tokens WHERE user_id = $1`, [userId])

  return true
}

// Check if a user's email is verified
export async function isEmailVerified(userId: string): Promise<boolean> {
  const result = await query(`SELECT email_verified FROM users WHERE id = $1`, [userId])

  if (result.rows.length === 0) {
    return false
  }

  return result.rows[0].email_verified === true
}

