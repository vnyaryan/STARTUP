import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "./lib/auth"

export async function middleware(request: NextRequest) {
  // Get token from cookie
  const token = request.cookies.get("auth_token")?.value

  // Check if the path is protected
  const isProtectedPath = request.nextUrl.pathname.startsWith("/dashboard")

  // If it's a protected path and no token exists, redirect to login
  if (isProtectedPath) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Verify token
    const payload = await verifyToken(token)

    if (!payload) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  // If user is logged in and tries to access login/signup, redirect to dashboard
  const isAuthPath = request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/signup"

  if (isAuthPath && token) {
    const payload = await verifyToken(token)

    if (payload) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup"],
}

