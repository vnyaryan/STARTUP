import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth"
import { cookies } from "next/headers"

export async function GET() {
  try {
    // Get the current session
    const session = await getSessionUser()

    // Get the auth token (but don't show the full value for security)
    const cookieStore = cookies()
    const token = cookieStore.get("auth_token")
    const tokenInfo = token
      ? {
          exists: true,
          name: token.name,
          path: token.path,
          value: token.value ? `${token.value.substring(0, 10)}...` : null,
          secure: token.secure,
          httpOnly: token.httpOnly,
        }
      : null

    return NextResponse.json({
      authenticated: !!session,
      session: session
        ? {
            id: session.id,
            email: session.email,
            username: session.username,
            role: session.role,
          }
        : null,
      tokenInfo,
      allCookies: cookieStore.getAll().map((c) => ({
        name: c.name,
        path: c.path,
        secure: c.secure,
        httpOnly: c.httpOnly,
      })),
    })
  } catch (error) {
    console.error("Debug auth error:", error)
    return NextResponse.json(
      {
        error: "Error debugging auth",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
