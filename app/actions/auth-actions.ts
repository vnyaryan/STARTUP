"use server"

import { getSql, initializeDatabase, checkUserExists } from "@/lib/db"
import { hashPassword } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { createSession, authenticateUser } from "@/lib/session"
import { redirect } from "next/navigation"

// Initialize the database on server start
initializeDatabase().catch((err) => {
  console.error("Failed to initialize database on startup:", err)
})

export async function signupUser(formData: FormData) {
  console.log("=== SIGNUP PROCESS STARTED ===")

  try {
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const day = formData.get("day") as string
    const month = formData.get("month") as string
    const year = formData.get("year") as string

    console.log(`Signup attempt for email: ${email}`)

    // Validate inputs
    if (!email || !password || !day || !month || !year) {
      console.log("Missing required fields")
      return { success: false, message: "All fields are required" }
    }

    // Make sure the table exists
    const initResult = await initializeDatabase()
    if (!initResult.success) {
      console.error("Failed to initialize database:", initResult.error)
      return {
        success: false,
        message: "Unable to connect to the database. Please try again later.",
        debug: process.env.NODE_ENV === "development" ? initResult.error : undefined,
      }
    }

    // Check if user already exists - with better error handling
    const userExists = await checkUserExists(email)

    if (userExists) {
      console.log(`User with email ${email} already exists`)
      return { success: false, message: "Email already registered" }
    }

    // Format date of birth (YYYY-MM-DD)
    const monthIndex =
      [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ].indexOf(month) + 1

    const dateOfBirth = `${year}-${monthIndex.toString().padStart(2, "0")}-${day.padStart(2, "0")}`

    // Hash the password
    const hashedPassword = hashPassword(password)

    // Insert the new user with better error handling
    try {
      console.log(`Inserting new user: ${email}`)
      const sql = getSql()

      const insertResult = await sql`
        INSERT INTO user_details (email_id, password, date_of_birth)
        VALUES (${email}, ${hashedPassword}, ${dateOfBirth})
        RETURNING email_id
      `

      console.log("User inserted successfully:", insertResult[0]?.email_id)

      if (!insertResult || insertResult.length === 0) {
        throw new Error("Insert operation did not return expected result")
      }
    } catch (error) {
      console.error("Error inserting new user:", error)

      // Check if it's a unique violation (duplicate email)
      const errorString = String(error)
      if (errorString.includes("unique constraint") || errorString.includes("duplicate key")) {
        return { success: false, message: "Email already registered" }
      }

      // For other errors
      return {
        success: false,
        message: "Failed to create account. Please try again.",
        debug: process.env.NODE_ENV === "development" ? String(error) : undefined,
      }
    }

    console.log("=== SIGNUP PROCESS COMPLETED SUCCESSFULLY ===")
    revalidatePath("/signup")
    return { success: true, message: "Account created successfully" }
  } catch (error) {
    console.error("Signup error:", error)
    console.log("=== SIGNUP PROCESS FAILED ===")
    return {
      success: false,
      message: "An error occurred during signup. Please try again.",
      debug: process.env.NODE_ENV === "development" ? String(error) : undefined,
    }
  }
}

export async function loginUser(formData: FormData) {
  try {
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    console.log(`Login attempt for email: ${email}`)

    // Validate inputs
    if (!email || !password) {
      return { success: false, message: "Email and password are required" }
    }

    // Authenticate the user
    const isAuthenticated = await authenticateUser(email, password)

    if (!isAuthenticated) {
      return { success: false, message: "Invalid email or password" }
    }

    // Create a session
    await createSession(email)

    console.log(`User ${email} logged in successfully`)
    revalidatePath("/login")

    // Return success
    return { success: true, message: "Login successful", email }
  } catch (error) {
    console.error("Login error:", error)
    return {
      success: false,
      message: "An error occurred during login. Please try again.",
      debug: process.env.NODE_ENV === "development" ? String(error) : undefined,
    }
  }
}

export async function logoutUser() {
  "use server"

  // This will be handled by the logout route
  redirect("/logout")
}
