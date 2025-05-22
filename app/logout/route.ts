import { NextResponse } from "next/server"
import { deleteSession } from "@/lib/session"
import { headers } from "next/headers"

export async function GET() {
  // Delete the session
  deleteSession()

  // Get the origin from request headers or use a relative URL
  const headersList = headers()
  const host = headersList.get("host") || ""
  const protocol = host.includes("localhost") ? "http" : "https"

  // Use a relative URL for redirection (simpler approach)
  return NextResponse.redirect(new URL("/login", `${protocol}://${host}`))
}
