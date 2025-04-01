import { randomBytes } from "crypto"
import { cookies } from "next/headers"
import type { NextResponse } from "next/server"
import { query } from "./db"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

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

// Sign a JWT token
export function signToken(payload: any, expiresIn = "7d") {
  return jwt.sign(payload, JWT_SECRET, { expiresIn })
}

// Verify a JWT token
export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

// Set auth cookie in response
export function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: "auth_token",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  })

  return response
}

// Get current user from request
export async function getCurrentUser() {
  const cookieStore = cookies()
  const token = cookieStore.get("auth_token")?.value

  if (!token) {
    return null
  }

  const payload = verifyToken(token)
  if (!payload || typeof payload !== "object") {
    return null
  }

  // Assuming payload has a userId field
  const userId = (payload as any).userId || (payload as any).id
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


