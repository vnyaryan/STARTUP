"use server"

import { executeQuery } from "@/lib/db"
import { z } from "zod"
import { getSessionUser } from "@/lib/auth"
import { revalidatePath } from "next/cache"

// Define the input schema for validation
const profileUpdateSchema = z.object({
  userId: z.string(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters" })
    .max(50, { message: "Username must not exceed 50 characters" })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "Username can only contain letters, numbers, and underscores",
    }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  gender: z.enum(["male", "female", "other"]),
  dateOfBirth: z.date(),
})

export async function updateUserProfile(data: unknown) {
  try {
    // Verify the user is authenticated
    const session = await getSessionUser()
    if (!session) {
      return { success: false, error: "Unauthorized" }
    }

    // Validate the input data
    const validatedData = profileUpdateSchema.parse(data)

    // Ensure the user is updating their own profile
    if (session.id !== validatedData.userId) {
      return { success: false, error: "You can only update your own profile" }
    }

    // Check if username is already taken (if changed)
    const currentUserResult = await executeQuery("SELECT username, email FROM users WHERE id = $1", [
      validatedData.userId,
    ])

    const currentUser = currentUserResult.rows[0]

    if (currentUser.username !== validatedData.username) {
      const usernameCheck = await executeQuery("SELECT id FROM users WHERE username = $1 AND id != $2", [
        validatedData.username,
        validatedData.userId,
      ])

      if (usernameCheck.rowCount > 0) {
        return { success: false, error: "Username is already taken" }
      }
    }

    // Check if email is already taken (if changed)
    if (currentUser.email !== validatedData.email) {
      const emailCheck = await executeQuery("SELECT id FROM users WHERE email = $1 AND id != $2", [
        validatedData.email,
        validatedData.userId,
      ])

      if (emailCheck.rowCount > 0) {
        return { success: false, error: "Email is already registered" }
      }
    }

    // Format the date to ensure it's in the correct format for PostgreSQL
    const formattedDate = validatedData.dateOfBirth.toISOString().split("T")[0]

    // Check if email has changed
    const emailChanged = currentUser.email !== validatedData.email

    // If email has changed, set email_verified to false and generate new verification token
    if (emailChanged) {
      // Generate verification token
      const verificationToken = Array.from({ length: 32 }, () => Math.floor(Math.random() * 36).toString(36)).join("")

      // Set token expiration (24 hours from now)
      const tokenExpires = new Date()
      tokenExpires.setHours(tokenExpires.getHours() + 24)

      // Update user with new email and verification status
      await executeQuery(
        `UPDATE users 
         SET username = $1, 
             email = $2, 
             gender = $3, 
             date_of_birth = $4,
             email_verified = FALSE,
             verification_token = $5,
             verification_token_expires = $6,
             updated_at = NOW()
         WHERE id = $7`,
        [
          validatedData.username,
          validatedData.email,
          validatedData.gender,
          formattedDate,
          verificationToken,
          tokenExpires,
          validatedData.userId,
        ],
      )

      // TODO: Send verification email to the new email address
      // This would be implemented similar to the signup flow
    } else {
      // Update user without changing verification status
      await executeQuery(
        `UPDATE users 
         SET username = $1, 
             email = $2, 
             gender = $3, 
             date_of_birth = $4,
             updated_at = NOW()
         WHERE id = $5`,
        [validatedData.username, validatedData.email, validatedData.gender, formattedDate, validatedData.userId],
      )
    }

    // Revalidate the profile page to reflect changes
    revalidatePath(`/profile`)

    return {
      success: true,
      emailChanged,
    }
  } catch (error) {
    console.error("Error updating profile:", error)

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
      error: "Failed to update profile",
    }
  }
}
