"use server"

import crypto from "crypto"
import { query } from "@/lib/db"
import { hashPassword } from "@/lib/auth"
import { sendVerificationEmail } from "@/lib/email"

export async function signupAction(formData: FormData) {
  // Extract form data
  const username = formData.get("username") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string
  const dateOfBirth = formData.get("dateOfBirth") as string

  // Validate form data
  if (!username || !email || !password || !confirmPassword || !dateOfBirth) {
    return { error: "All fields are required" }
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" }
  }

  // Validate date of birth (must be at least 18 years old)
  const dobDate = new Date(dateOfBirth)
  const today = new Date()
  const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())

  if (dobDate > eighteenYearsAgo) {
    return { error: "You must be at least 18 years old to register" }
  }

  try {
    // Check if username or email already exists
    const existingUser = await query("SELECT * FROM users WHERE username = $1 OR email = $2", [username, email])

    if (existingUser.rows.length > 0) {
      return { error: "Username or email already exists" }
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex")

    // Insert user into database
    await query(
      `INSERT INTO users (username, email, password, date_of_birth, verification_token)
       VALUES ($1, $2, $3, $4, $5)`,
      [username, email, hashedPassword, dateOfBirth, verificationToken],
    )

    // Send verification email
    await sendVerificationEmail(email, verificationToken)

    return { success: true }
  } catch (error) {
    console.error("Error creating user", error)
    return { error: "Failed to create user" }
  }
}

