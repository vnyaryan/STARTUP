"use server"

import { query } from "@/lib/db"
import { comparePasswords, createToken, setAuthCookie } from "@/lib/auth"

export async function loginAction(formData: FormData) {
  // Extract form data
  const username = formData.get("username") as string
  const password = formData.get("password") as string

  // Validate form data
  if (!username || !password) {
    return { error: "Username and password are required" }
  }

  try {
    // Find user by username
    const result = await query("SELECT * FROM users WHERE username = $1", [username])

    if (result.rows.length === 0) {
      return { error: "Invalid username or password" }
    }

    const user = result.rows[0]

    // Check if email is verified
    if (!user.email_verified) {
      return { error: "Please verify your email before logging in" }
    }

    // Compare passwords
    const passwordMatch = await comparePasswords(password, user.password)

    if (!passwordMatch) {
      return { error: "Invalid username or password" }
    }

    // Create JWT token
    const token = await createToken({
      id: user.id,
      username: user.username,
    })

    // Set auth cookie
    setAuthCookie(token)

    return { success: true }
  } catch (error) {
    console.error("Error logging in", error)
    return { error: "Failed to log in" }
  }
}

