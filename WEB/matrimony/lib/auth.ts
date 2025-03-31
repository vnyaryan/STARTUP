import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import type { SafeUser } from "@/types/user"

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-do-not-use-in-production"
const secret = new TextEncoder().encode(JWT_SECRET)

// Create a JWT token
export async function signToken(payload: any): Promise<string> {
  return new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("24h").sign(secret)
}

// Verify a JWT token
export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload
  } catch (error) {
    return null
  }
}

// Set auth cookie
export function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: "auth_token",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 1 day
    path: "/",
  })
  return response
}

// Get current user from cookie
export async function getCurrentUser(): Promise<SafeUser | null> {
  const cookieStore = cookies()
  const token = cookieStore.get("auth_token")?.value

  if (!token) {
    return null
  }

  const payload = await verifyToken(token)
  return (payload as SafeUser) || null
}

// Middleware to protect routes
export async function withAuth(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  const payload = await verifyToken(token)

  if (!payload) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

