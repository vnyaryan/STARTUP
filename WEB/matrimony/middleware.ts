import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Add paths that should be protected
const protectedPaths = ["/dashboard", "/profile", "/settings"]

// Add paths that should be accessible only to non-authenticated users
const authPaths = ["/login", "/signup", "/reset-password"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get token from cookies
  const token = request.cookies.get("auth_token")?.value

  // Check if user is authenticated (simplified check)
  const isAuthenticated = !!token

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && authPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Redirect unauthenticated users away from protected pages
  if (!isAuthenticated && protectedPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - api (API routes)
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    // - public folder
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
}

