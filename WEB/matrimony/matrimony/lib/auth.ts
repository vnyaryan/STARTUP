import { cookies } from "next/headers"
import type { NextResponse } from "next/server"
import { query } from "./db"

// Create a session for a user
export async function createSession(userId: string) {
  // Generate a random token without using crypto
  const token = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("")

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

// Get current user from request
export async function getCurrentUser() {
  const cookieStore = cookies()
  const token = cookieStore.get("session_token")?.value

  if (!token) {
    return null
  }

  // Validate the session token
  const userId = await validateSession(token)
  if (!userId) {
    return null
  }

  // Get user from database
  const result = await query("SELECT id, name, email, email_verified FROM users WHERE id = $1", [userId])

  if (result.rows.length === 0) {
    return null
  }

  return result.rows[0]
}

// Set auth cookie in response
export function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: "session_token",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  })

  return response
}

