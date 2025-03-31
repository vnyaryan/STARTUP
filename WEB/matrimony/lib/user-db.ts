import bcrypt from "bcrypt"
import type { SafeUser } from "./types" // Assuming SafeUser is defined in types.ts
import { getUserByEmail } from "./db" // Assuming getUserByEmail is defined in db.ts

export async function verifyUser(email: string, password: string): Promise<SafeUser | null> {
  const user = await getUserByEmail(email)

  if (!user) {
    console.log("User not found:", email)
    return null
  }

  console.log("User found, comparing passwords")
  console.log("Stored password hash format check:", user.password.substring(0, 7)) // Should start with $2a$, $2b$, or $2y$

  try {
    const passwordMatch = await bcrypt.compare(password, user.password)
    console.log("Password comparison result:", passwordMatch)

    if (!passwordMatch) {
      return null
    }

    // Return user without password
    const { password: _, ...safeUser } = user
    return safeUser as SafeUser
  } catch (error) {
    console.error("Error comparing passwords:", error)
    return null
  }
}

