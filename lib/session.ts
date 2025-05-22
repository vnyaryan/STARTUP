import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { verifyPassword } from "./auth"
import { getSql } from "./db"

// Session cookie name
const SESSION_COOKIE = "auth_session"

// Session type
export type UserSession = {
  userId: string
  email: string
  isLoggedIn: boolean
}

// Create a new session
export async function createSession(email: string): Promise<string> {
  // Generate a simple session ID (in a real app, use a more secure method)
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`

  // Store session in a cookie (in a real app, you might want to store in a database too)
  cookies().set({
    name: SESSION_COOKIE,
    value: JSON.stringify({ sessionId, email, isLoggedIn: true }),
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    // In production, you'd want to set secure: true
    secure: process.env.NODE_ENV === "production",
    // Expire in 24 hours
    maxAge: 60 * 60 * 24,
  })

  return sessionId
}

// Get the current session
export function getSession(): UserSession | null {
  const sessionCookie = cookies().get(SESSION_COOKIE)

  if (!sessionCookie) {
    return null
  }

  try {
    const session = JSON.parse(sessionCookie.value)
    return {
      userId: session.sessionId,
      email: session.email,
      isLoggedIn: session.isLoggedIn,
    }
  } catch (error) {
    // Invalid session format
    return null
  }
}

// Delete the session (logout)
export function deleteSession() {
  cookies().delete(SESSION_COOKIE)
}

// Authenticate a user
export async function authenticateUser(email: string, password: string): Promise<boolean> {
  try {
    const sql = getSql()

    // Get the user from the database
    const users = await sql`
      SELECT email_id, password FROM user_details WHERE email_id = ${email}
    `

    if (users.length === 0) {
      return false
    }

    const user = users[0]

    // Verify the password
    const passwordValid = verifyPassword(user.password, password)

    return passwordValid
  } catch (error) {
    console.error("Authentication error:", error)
    return false
  }
}

// Get user details
export async function getUserDetails(email: string) {
  try {
    const sql = getSql()

    const users = await sql`
      SELECT email_id, date_of_birth, username, age, sex FROM user_details WHERE email_id = ${email}
    `

    if (users.length === 0) {
      return null
    }

    return {
      email: users[0].email_id,
      dateOfBirth: users[0].date_of_birth,
      username: users[0].username,
      age: users[0].age,
      sex: users[0].sex,
    }
  } catch (error) {
    console.error("Error getting user details:", error)
    return null
  }
}

// Middleware to require authentication
export function requireAuth() {
  const session = getSession()

  if (!session || !session.isLoggedIn) {
    redirect("/login")
  }

  return session
}
