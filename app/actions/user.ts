"use server"

import { executeQuery } from "@/lib/db"
import { z } from "zod"
import { hashPassword, comparePasswords, createToken, getUserRole } from "@/lib/auth"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { setupImageTables } from "@/app/actions/db-setup"
import { moveTempProfilePicture } from "@/app/actions/image-upload"
import { generateVerificationToken, sendVerificationEmail } from "@/lib/email"

// Import the utility function at the top of the file
import { createVerificationUrl } from "@/lib/verification-utils"

// Define the input schema for validation
const userSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(50),
  dateOfBirth: z.date(),
  gender: z.enum(["male", "female", "other"]),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  profileImageUrl: z.string().nullable().optional(),
})

// Login schema
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
})

// Function to check if the database is initialized
export async function ensureTableExists() {
  try {
    // Check if the users table exists, if not create it
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(50) UNIQUE NOT NULL,
        date_of_birth DATE NOT NULL,
        gender VARCHAR(10) NOT NULL,
        password_hash TEXT NOT NULL,
        profile_image_url TEXT,
        role VARCHAR(20) DEFAULT 'user',
        email_verified BOOLEAN DEFAULT FALSE,
        verification_token TEXT,
        verification_token_expires TIMESTAMP WITH TIME ZONE,
        reset_token TEXT,
        reset_token_expires TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `)
    return true
  } catch (error) {
    console.error("Error ensuring table exists:", error)
    return false
  }
}

// Function to create a new user
export async function createUser(userData: unknown) {
  try {
    // Validate the input data
    const validatedData = userSchema.parse(userData)

    // Ensure the database table exists and has all required columns
    await setupImageTables()
    const tableExists = await ensureTableExists()
    if (!tableExists) {
      return { success: false, error: "Database initialization failed" }
    }

    // Check if email already exists
    const emailCheck = await executeQuery("SELECT email FROM users WHERE email = $1", [validatedData.email])

    if (emailCheck.rowCount > 0) {
      return { success: false, error: "Email is already registered" }
    }

    // Check if username already exists
    const usernameCheck = await executeQuery("SELECT username FROM users WHERE username = $1", [validatedData.username])

    if (usernameCheck.rowCount > 0) {
      return { success: false, error: "Username is already taken" }
    }

    // Hash the password
    const passwordHash = await hashPassword(validatedData.password)

    // Format the date to ensure it's in the correct format for PostgreSQL
    const formattedDate = validatedData.dateOfBirth.toISOString().split("T")[0]

    // Generate verification token
    const verificationToken = generateVerificationToken()

    // Set token expiration (24 hours from now)
    const tokenExpires = new Date()
    tokenExpires.setHours(tokenExpires.getHours() + 24)

    // Insert the new user into the database with verification token
    const result = await executeQuery(
      `INSERT INTO users (
        email, 
        username, 
        date_of_birth, 
        gender, 
        password_hash, 
        role, 
        verification_token, 
        verification_token_expires
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id`,
      [
        validatedData.email,
        validatedData.username,
        formattedDate,
        validatedData.gender,
        passwordHash,
        "user",
        verificationToken,
        tokenExpires,
      ],
    )

    const userId = result.rows[0]?.id

    // If there's a profile image URL, move it from temporary storage to permanent storage
    if (validatedData.profileImageUrl) {
      await moveTempProfilePicture(userId)
    }

    // Send verification email directly using the utility function
    // In the sendVerificationEmail function inside the createUser function, replace:
    // const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    // const verificationUrl = `${baseUrl}/api/auth/verify-email?token=${verificationToken}`

    // With:
    const verificationUrl = createVerificationUrl(verificationToken)
    const emailResult = await sendVerificationEmail({
      to: validatedData.email,
      username: validatedData.username,
      verificationToken,
      verificationUrl,
    })

    const emailSent = emailResult.success
    const emailError = emailResult.success ? null : "Failed to send verification email. Please try again later."

    // Return success response with the new user ID and email status
    return {
      success: true,
      userId: userId,
      emailSent,
      emailError,
    }
  } catch (error) {
    console.error("Error creating user:", error)

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid input data",
        details: error.errors,
      }
    }

    // Handle other errors
    return {
      success: false,
      error: "Failed to create user account",
    }
  }
}

// Function to login a user
export async function loginUser(credentials: unknown) {
  try {
    // Validate the input data
    const validatedData = loginSchema.parse(credentials)

    // Find the user by email
    const result = await executeQuery(
      "SELECT id, username, email, password_hash, profile_image_url, email_verified FROM users WHERE email = $1",
      [validatedData.email],
    )

    if (result.rowCount === 0) {
      return { success: false, error: "Invalid email or password" }
    }

    const user = result.rows[0]

    // Compare passwords
    const passwordMatch = await comparePasswords(validatedData.password, user.password_hash)

    if (!passwordMatch) {
      return { success: false, error: "Invalid email or password" }
    }

    // Check if email is verified
    if (!user.email_verified) {
      return {
        success: false,
        error: "Please verify your email address before logging in. Check your inbox for a verification email.",
        needsVerification: true,
      }
    }

    // Get user role (safely)
    let role = "user"
    try {
      role = await getUserRole(user.id)
    } catch (error) {
      console.error("Error getting user role:", error)
      // Default to user role if there's an error
    }

    // Create a JWT token
    const token = await createToken({
      id: user.id,
      email: user.email,
      username: user.username,
      role: role,
    })

    // Set the token in a cookie
    // Adjust expiration based on rememberMe option
    const maxAge = validatedData.rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 // 30 days or 1 day

    cookies().set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: maxAge,
    })

    console.log(`Login successful for user ${user.id} (${user.username}), token set in cookie`)

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: role,
        profileImageUrl: user.profile_image_url || null,
      },
    }
  } catch (error) {
    console.error("Login error:", error)

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid input data",
        details: error.errors,
      }
    }

    // Handle other errors
    return {
      success: false,
      error: "Failed to log in",
    }
  }
}

// Function to resend verification email
export async function resendVerificationEmail(email: string) {
  try {
    // Find the user by email
    const result = await executeQuery("SELECT id, username, email, email_verified FROM users WHERE email = $1", [email])

    if (result.rowCount === 0) {
      return { success: false, error: "Email not found" }
    }

    const user = result.rows[0]

    // Check if email is already verified
    if (user.email_verified) {
      return { success: false, error: "Email is already verified" }
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken()

    // Set token expiration (24 hours from now)
    const tokenExpires = new Date()
    tokenExpires.setHours(tokenExpires.getHours() + 24)

    // Update user with new verification token
    await executeQuery(
      `UPDATE users 
       SET verification_token = $1, 
           verification_token_expires = $2,
           updated_at = NOW()
       WHERE id = $3`,
      [verificationToken, tokenExpires, user.id],
    )

    // Send verification email directly using the utility function
    const verificationUrl = createVerificationUrl(verificationToken)
    const emailResult = await sendVerificationEmail({
      to: user.email,
      username: user.username,
      verificationToken,
      verificationUrl,
    })

    const emailSent = emailResult.success
    const emailError = emailResult.success ? null : "Failed to send verification email. Please try again later."

    return {
      success: true,
      emailSent,
      emailError,
    }
  } catch (error) {
    console.error("Error resending verification email:", error)
    return {
      success: false,
      error: "Failed to resend verification email",
    }
  }
}

// Function to logout a user
export async function logoutUser() {
  cookies().set({
    name: "auth_token",
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0, // Expire immediately
  })

  redirect("/")
}

// Function to set a user as admin (for development purposes)
export async function setUserAsAdmin(userId: string) {
  try {
    // Check if role column exists
    const roleColumnCheck = await executeQuery(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'role'
    `)

    // If role column doesn't exist, add it
    if (roleColumnCheck.rowCount === 0) {
      await executeQuery(`
        ALTER TABLE users 
        ADD COLUMN role VARCHAR(20) DEFAULT 'user'
      `)
    }

    await executeQuery("UPDATE users SET role = 'admin' WHERE id = $1", [userId])
    return { success: true }
  } catch (error) {
    console.error("Error setting user as admin:", error)
    return { success: false, error: "Failed to set user as admin" }
  }
}
