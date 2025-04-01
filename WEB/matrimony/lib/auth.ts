import { randomBytes } from "crypto"
import { query } from "./db"

// Create a session for a user
export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex")
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  await query(
    `INSERT INTO sessions (user_id, token, expires) 
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id) DO UPDATE 
     SET token = $2, expires = $3`,
    [userId, token, expires],
  )

  return { token, expires }
}

// Validate a session
export async function validateSession(token: string) {
  const result = await query(
    `SELECT user_id FROM sessions 
     WHERE token = $1 AND expires > NOW()`,
    [token],
  )

  return result.rows.length > 0 ? result.rows[0].user_id : null
}

