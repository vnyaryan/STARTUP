import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import type { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { query } from "./db"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const COOKIE_NAME = "auth_token"

// User type definition
export type User = {
  id: string
  username: string
  email?: string
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10)
}

// Compare password with hash
export async function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
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
    return payload
  } catch (error) {
    return null
  }
}

// Get current user from token
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = cookies()
  const token = cookieStore.get("auth_token")?.value

  if (!token) {
    return null
  }

  try {
    const payload = await verifyToken(token)
    if (!payload) return null

    return {
      id: payload.id,
      username: payload.username,
    }
  } catch (error) {
    return null
  }
}

// Add the missing setAuthCookie function
export function setAuthCookie(response: NextResponse, token: string): NextResponse {
  // Set cookie with HttpOnly flag for security
  response.cookies.set({
    name: "auth_token",
    value: token,
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24, // 1 day
  })

  return response
}

// Function to set auth cookie in API routes
export function setAuthCookieInApiRoute(token: string): Response {
  const response = new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  })

  const cookieValue = `auth_token=${token}; Path=/; HttpOnly; Max-Age=${60 * 60 * 24}; SameSite=Lax${
    process.env.NODE_ENV === "production" ? "; Secure" : ""
  }`

  response.headers.set("Set-Cookie", cookieValue)

  return response
}

// Function to clear auth cookie
export function clearAuthCookie(): void {
  const cookieStore = cookies()
  cookieStore.delete("auth_token")
}

// Set auth cookie (for server actions)
// export function setAuthCookie(token: string): void {
//   cookies().set(COOKIE_NAME, token, {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     maxAge: 60 * 60 * 24, // 1 day
//     path: "/",
//     sameSite: "lax",
//   })
// }

// Get auth cookie
export function getAuthCookie(): string | undefined {
  return cookies().get(COOKIE_NAME)?.value
}

// Remove auth cookie (for server actions)
export function removeAuthCookie(): void {
  cookies().delete(COOKIE_NAME)
}

// // Get current user
// export async function getCurrentUser() {
//   const token = getAuthCookie()

//   if (!token) {
//     return null
//   }

//   const { success, payload } = await verifyToken(token)

//   if (!success || !payload) {
//     return null
//   }

//   try {
//     const result = await query("SELECT id, username, email, email_verified FROM users WHERE id = $1", [payload.id])

//     if (result.rows.length === 0) {
//       return null
//     }

//     return result.rows[0]
//   } catch (error) {
//     console.error("Error getting current user", error)
//     return null
//   }
// }

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

  if (!verificationResult) {
    return {
      success: false,
      error: "Invalid or expired token",
      status: 401,
    }
  }

  try {
    const result = await query("SELECT id, username, email, email_verified FROM users WHERE id = $1", [
      verificationResult.id,
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

