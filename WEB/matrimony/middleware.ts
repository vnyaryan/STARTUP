import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "./lib/auth"

// Define which paths require authentication
const protectedPaths = ["/dashboard"]

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Check if the path is protected
  if (protectedPaths.some((prefix) => path.startsWith(prefix))) {
    const token = request.cookies.get("auth_token")?.value

    if (!token) {
      const url = new URL("/login", request.url)
      url.searchParams.set("from", path)
      return NextResponse.redirect(url)
    }

    const verificationResult = await verifyToken(token)

    if (!verificationResult.success) {
      const url = new URL("/login", request.url)
      url.searchParams.set("from", path)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}

