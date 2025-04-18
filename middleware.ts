import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "./lib/auth"

// List of public routes that don't require authentication
const publicRoutes = [
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/verification-success",
  "/verification-error",
  "/verification-expired",
  "/debug",
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the route is public
  if (publicRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
    return NextResponse.next()
  }

  // Check for static files and API routes
  if (pathname.includes("/_next") || pathname.includes("/api/")) {
    return NextResponse.next()
  }

  // Get the token from the cookies
  const token = request.cookies.get("auth_token")?.value

  // If there's no token, redirect to login
  if (!token) {
    console.log(`Middleware: No auth token found, redirecting from ${pathname} to login`)
    const url = new URL("/login", request.url)
    url.searchParams.set("redirect", pathname)
    return NextResponse.redirect(url)
  }

  try {
    // Verify the token
    const payload = await verifyToken(token)

    // If the token is invalid, redirect to login
    if (!payload) {
      console.log(`Middleware: Invalid token, redirecting from ${pathname} to login`)
      const url = new URL("/login", request.url)
      url.searchParams.set("redirect", pathname)
      return NextResponse.redirect(url)
    }

    // Continue to the protected route
    console.log(`Middleware: Valid token for user ${payload.id}, allowing access to ${pathname}`)
    return NextResponse.next()
  } catch (error) {
    console.error(`Middleware error for ${pathname}:`, error)
    // If there's an error, redirect to login
    const url = new URL("/login", request.url)
    url.searchParams.set("redirect", pathname)
    return NextResponse.redirect(url)
  }
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: ["/profile/:path*", "/browse/:path*", "/messages/:path*", "/settings/:path*", "/admin/:path*"],
}
