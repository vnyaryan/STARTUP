import { getSessionUser } from "@/lib/auth"
import { executeQuery } from "@/lib/db"
import { cookies } from "next/headers"

export default async function DebugPage() {
  // Get all cookies
  const cookieStore = cookies()
  const allCookies = cookieStore.getAll()
  const authCookie = cookieStore.get("auth_token")

  // Get session user
  const session = await getSessionUser()

  // Try to get user from database if we have a session
  let dbUser = null
  let dbError = null
  if (session && session.id) {
    try {
      const result = await executeQuery("SELECT * FROM users WHERE id = $1", [session.id])
      dbUser = result.rows[0]
    } catch (error) {
      dbError = error instanceof Error ? error.message : "Unknown database error"
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Debug Information</h1>

      <div className="bg-gray-100 p-4 rounded mb-6">
        <h2 className="text-xl font-semibold mb-2">Auth Cookie</h2>
        {authCookie ? (
          <pre className="bg-white p-2 rounded overflow-auto">
            {JSON.stringify(
              {
                name: authCookie.name,
                value: authCookie.value ? `${authCookie.value.substring(0, 10)}...` : null,
                path: authCookie.path,
                expires: authCookie.expires,
              },
              null,
              2,
            )}
          </pre>
        ) : (
          <p className="text-red-500">No auth_token cookie found</p>
        )}
      </div>

      <div className="bg-gray-100 p-4 rounded mb-6">
        <h2 className="text-xl font-semibold mb-2">Session Data</h2>
        {session ? (
          <pre className="bg-white p-2 rounded overflow-auto">{JSON.stringify(session, null, 2)}</pre>
        ) : (
          <p className="text-red-500">No session found</p>
        )}
      </div>

      <div className="bg-gray-100 p-4 rounded mb-6">
        <h2 className="text-xl font-semibold mb-2">Database User</h2>
        {dbUser ? (
          <pre className="bg-white p-2 rounded overflow-auto">
            {JSON.stringify(
              {
                id: dbUser.id,
                username: dbUser.username,
                email: dbUser.email,
                gender: dbUser.gender,
                date_of_birth: dbUser.date_of_birth,
                profile_image_url: dbUser.profile_image_url,
                email_verified: dbUser.email_verified,
                role: dbUser.role,
              },
              null,
              2,
            )}
          </pre>
        ) : (
          <p className="text-red-500">{dbError ? `Error: ${dbError}` : "No user found in database"}</p>
        )}
      </div>

      <div className="bg-gray-100 p-4 rounded">
        <h2 className="text-xl font-semibold mb-2">All Cookies</h2>
        <pre className="bg-white p-2 rounded overflow-auto">
          {JSON.stringify(
            allCookies.map((c) => ({ name: c.name, path: c.path })),
            null,
            2,
          )}
        </pre>
      </div>
    </div>
  )
}
