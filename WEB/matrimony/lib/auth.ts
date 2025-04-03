import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"
import bcryptjs from "bcryptjs" // Changed from bcrypt to bcryptjs
import { query } from "./db"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const COOKIE_NAME = "auth_token"

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return await bcryptjs.hash(password, 10) // Using bcryptjs instead
}

// Compare password with hash
export async function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
  return await bcryptjs.compare(password, hashedPassword) // Using bcryptjs instead
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
export async function getCurrentUser() {
  const cookieStore = cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value

  if (!token) {
    return null
  }

  try {
    const payload = await verifyToken(token)
    if (!payload) return null

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

// Set auth cookie (for server actions)
export function setAuthCookie(token: string): void {
  const cookieStore = cookies()
  if (cookieStore) {
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
      sameSite: "lax",
    })
  }
}

// Get auth cookie
export function getAuthCookie(): string | undefined {
  return cookies().get(COOKIE_NAME)?.value
}

// Remove auth cookie (for server actions)
export function removeAuthCookie(): void {
  const cookieStore = cookies()
  if (cookieStore) {
    cookieStore.delete(COOKIE_NAME)
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

export async function login(email: string, password: string) {
  try {
    const result = await query("SELECT * FROM users WHERE email = $1", [email])
    if (result.rows.length === 0) {
      return { success: false, error: "Invalid email or password" }
    }
    const user = result.rows[0]
    const passwordMatch = await comparePasswords(password, user.password)
    if (!passwordMatch) {
      return { success: false, error: "Invalid email or password" }
    }
    const token = await createToken({ id: user.id, username: user.username })
    setAuthCookie(token)
    return { success: true, user }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

