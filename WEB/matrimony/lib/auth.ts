import { cookies } from "next/headers"
import type { NextResponse } from "next/server"
import { SignJWT, jwtVerify } from "jose"
import bcrypt from "bcryptjs"
import { query } from "./db"

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const COOKIE_NAME = "auth_token"

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

// Compare password with hash
export async function comparePasswords(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Create JWT token
export async function createToken(payload: any): Promise<string> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(new TextEncoder().encode(JWT_SECRET))

  return token
}

// Verify JWT token
export async function verifyToken(token: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET))
    return { success: true, payload }
  } catch (error) {
    return { success: false, error: "Invalid token" }
  }
}

// Set auth cookie
export function setAuthCookie(token: string, response?: NextResponse): void {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24, // 1 day
    path: "/",
    sameSite: "lax" as const,
  }

  if (response) {
    // For API routes
    response.cookies.set(COOKIE_NAME, token, cookieOptions)
  } else {
    // For server actions
    cookies().set(COOKIE_NAME, token, cookieOptions)
  }
}

// Get auth cookie
export function getAuthCookie(): string | undefined {
  return cookies().get(COOKIE_NAME)?.value
}

// Remove auth cookie
export function removeAuthCookie(response?: NextResponse): void {
  if (response) {
    // For API routes
    response.cookies.delete(COOKIE_NAME)
  } else {
    // For server actions
    cookies().delete(COOKIE_NAME)
  }
}

// Get current user
export async function getCurrentUser() {
  const token = getAuthCookie()

  if (!token) {
    return null
  }

  const { success, payload } = await verifyToken(token)

  if (!success || !payload) {
    return null
  }

  try {
    const result = await query("SELECT id, username, email, email_verified FROM users WHERE id = $1", [payload.id])

    if (result.rows.length === 0) {
      return null
    }

    return result.rows[0]
  } catch (error) {
    console.error("Error getting current user", error)
    return null
  }
}

// Verify authentication for API routes
export async function verifyAuth(request: Request) {
  const token = request.headers.get("Authorization")?.split("Bearer ")[1] || request.cookies.get(COOKIE_NAME)?.value

  if (!token) {
    return {
      success: false,
      error: "Authentication required",
      status: 401,
    }
  }

  const verificationResult = await verifyToken(token)

  if (!verificationResult.success) {
    return {
      success: false,
      error: "Invalid or expired token",
      status: 401,
    }
  }

  try {
    const result = await query("SELECT id, username, email, email_verified FROM users WHERE id = $1", [
      verificationResult.payload.id,
    ])

    if (result.rows.length === 0) {
      return {
        success: false,
        error: "User not found",
        status: 401,
      }
    }

    return {
      success: true,
      user: result.rows[0],
    }
  } catch (error) {
    return {
      success: false,
      error: "Server error",
      status: 500,
    }
  }
}

