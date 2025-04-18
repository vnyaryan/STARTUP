import { jwtVerify, SignJWT } from "jose"
import { cookies } from "next/headers"
import type { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { executeQuery } from "@/lib/db"

// Secret key for JWT signing
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this-in-production"

// JWT expiration time (1 day)
const EXPIRES_IN = "1d"

// Hash a password
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10
  return bcrypt.hash(password, saltRounds)
}

// Compare a password with a hash
export async function comparePasswords(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Create a JWT token
export async function createToken(payload: any): Promise<string> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(EXPIRES_IN)
    .sign(new TextEncoder().encode(JWT_SECRET))

  return token
}

// Verify a JWT token
export async function verifyToken(token: string): Promise<any> {
  try {
    console.log("Verifying token:", token.substring(0, 20) + "...")
    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET))
    console.log("Token verified, payload:", JSON.stringify(payload, null, 2))
    return payload
  } catch (error) {
    console.error("Token verification error:", error)
    return null
  }
}

// Set authentication cookie
export function setAuthCookie(response: NextResponse, token: string, rememberMe = false): void {
  // Adjust expiration based on rememberMe option
  const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 // 30 days or 1 day

  response.cookies.set({
    name: "auth_token",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: maxAge,
  })
}

// Get current user from request
export async function getCurrentUser(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value

  if (!token) {
    return null
  }

  const payload = await verifyToken(token)
  return payload
}

// Get current user from server component
export async function getSessionUser() {
  const cookieStore = cookies()
  const token = cookieStore.get("auth_token")?.value

  if (!token) {
    console.log("No auth token found in cookies")
    return null
  }

  try {
    const payload = await verifyToken(token)
    return payload
  } catch (error) {
    console.error("Error verifying session token:", error)
    return null
  }
}

// Get user role from database
export async function getUserRole(userId: string): Promise<string> {
  try {
    // Check if the role column exists
    const columnCheck = await executeQuery(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'role'
    `)

    // If the role column doesn't exist, return default role
    if (columnCheck.rowCount === 0) {
      return "user"
    }

    // Get the user's role
    const result = await executeQuery("SELECT role FROM users WHERE id = $1", [userId])

    if (result.rowCount === 0) {
      return "user"
    }

    return result.rows[0].role || "user"
  } catch (error) {
    console.error("Error getting user role:", error)
    return "user"
  }
}

// Clear authentication cookie
export function clearAuthCookie(response: NextResponse): void {
  response.cookies.set({
    name: "auth_token",
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  })
}

// Password validation
export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters long" }
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one uppercase letter" }
  }

  if (!/[a-z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one lowercase letter" }
  }

  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "Password must contain at least one number" }
  }

  return { valid: true }
}
