// Remove the import from next/headers
import { SignJWT, jwtVerify } from "jose"
import bcryptjs from "bcryptjs"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const COOKIE_NAME = "auth_token"

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return await bcryptjs.hash(password, 10)
}

// Compare password with hash
export async function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
  return await bcryptjs.compare(password, hashedPassword)
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
export async function verifyToken(token: string): Promise<{ id: any; username: any; success: boolean }> {
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET))
    return { id: payload.id, username: payload.username, success: true }
  } catch (error) {
    return { id: null, username: null, success: false }
  }
}

// Get current user from token
export async function getCurrentUser() {
  return null
}

// Set auth cookie
export function setAuthCookie(token: string) {
  return
}

// Remove auth cookie
export function removeAuthCookie() {
  return
}

export async function login(email: string, password: string) {
  return { success: false, error: "Not implemented" }
}

