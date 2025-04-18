"use server"

import { put, del } from "@vercel/blob"
import { revalidatePath } from "next/cache"
import { executeQuery } from "@/lib/db"
import { cookies } from "next/headers"

// Define allowed image types and max size
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const MAX_PROFILE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_GALLERY_SIZE = 10 * 1024 * 1024 // 10MB

// Upload profile picture
export async function uploadProfilePicture(userId: string, file: File) {
  try {
    // Validate file type and size
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return { success: false, error: "Invalid file type. Please upload a JPG, PNG, WebP, or GIF." }
    }

    if (file.size > MAX_PROFILE_SIZE) {
      return { success: false, error: "File too large. Maximum size is 5MB." }
    }

    // Generate a unique filename with user ID and timestamp
    const filename = `profiles/${userId}/${Date.now()}-${file.name.replace(/\s+/g, "-")}`

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: "public",
      addRandomSuffix: true, // Adds a random suffix to prevent filename collisions
    })

    // Get existing profile image URL to delete later
    const result = await executeQuery("SELECT profile_image_url FROM users WHERE id = $1", [userId])

    const oldImageUrl = result.rows[0]?.profile_image_url

    // Update user record with new image URL
    await executeQuery("UPDATE users SET profile_image_url = $1, updated_at = NOW() WHERE id = $2", [blob.url, userId])

    // Delete old image if it exists
    if (oldImageUrl) {
      try {
        // Extract the pathname from the URL
        const oldUrlObj = new URL(oldImageUrl)
        const pathname = oldUrlObj.pathname.substring(1) // Remove leading slash

        await del(pathname)
      } catch (error) {
        console.error("Failed to delete old profile image:", error)
        // Continue execution even if deletion fails
      }
    }

    // Revalidate user profile page
    revalidatePath(`/profile/${userId}`)

    return {
      success: true,
      imageUrl: blob.url,
    }
  } catch (error) {
    console.error("Profile image upload error:", error)
    return {
      success: false,
      error: "Failed to upload profile image. Please try again.",
    }
  }
}

// Upload temporary profile picture (for signup process)
export async function uploadTempProfilePicture(file: File) {
  try {
    // Validate file type and size
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return { success: false, error: "Invalid file type. Please upload a JPG, PNG, WebP, or GIF." }
    }

    if (file.size > MAX_PROFILE_SIZE) {
      return { success: false, error: "File too large. Maximum size is 5MB." }
    }

    // Generate a unique filename with timestamp
    const filename = `temp/profiles/${Date.now()}-${file.name.replace(/\s+/g, "-")}`

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: "public",
      addRandomSuffix: true,
    })

    // Store the URL in a cookie for later use
    cookies().set("temp_profile_image", blob.url, {
      maxAge: 60 * 30, // 30 minutes
      path: "/",
    })

    return {
      success: true,
      imageUrl: blob.url,
    }
  } catch (error) {
    console.error("Temp profile image upload error:", error)
    return {
      success: false,
      error: "Failed to upload profile image. Please try again.",
    }
  }
}

// Move temporary profile picture to permanent storage
export async function moveTempProfilePicture(userId: string) {
  try {
    // Get the temporary profile image URL from the cookie
    const tempImageUrl = cookies().get("temp_profile_image")?.value

    if (!tempImageUrl) {
      return { success: true, imageUrl: null }
    }

    // Extract the pathname from the URL
    const tempUrlObj = new URL(tempImageUrl)
    const tempPathname = tempUrlObj.pathname.substring(1) // Remove leading slash

    // Generate a new filename for the permanent storage
    const filename = `profiles/${userId}/${Date.now()}-profile-image`

    // Get the blob
    const tempBlob = await fetch(tempImageUrl)
    const blobData = await tempBlob.blob()

    // Upload to permanent storage
    const blob = await put(filename, blobData, {
      access: "public",
      addRandomSuffix: true,
    })

    // Update user record with new image URL
    await executeQuery("UPDATE users SET profile_image_url = $1, updated_at = NOW() WHERE id = $2", [blob.url, userId])

    // Delete the temporary image
    try {
      await del(tempPathname)
    } catch (error) {
      console.error("Failed to delete temporary profile image:", error)
      // Continue execution even if deletion fails
    }

    // Clear the cookie
    cookies().delete("temp_profile_image")

    return {
      success: true,
      imageUrl: blob.url,
    }
  } catch (error) {
    console.error("Move temp profile image error:", error)
    return {
      success: false,
      error: "Failed to process profile image. Please try again.",
    }
  }
}

// Upload gallery image
export async function uploadGalleryImage(userId: string, file: File) {
  try {
    // Validate file type and size
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return { success: false, error: "Invalid file type. Please upload a JPG, PNG, WebP, or GIF." }
    }

    if (file.size > MAX_GALLERY_SIZE) {
      return { success: false, error: "File too large. Maximum size is 10MB." }
    }

    // Generate a unique filename with user ID and timestamp
    const filename = `gallery/${userId}/${Date.now()}-${file.name.replace(/\s+/g, "-")}`

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: "public",
      addRandomSuffix: true,
    })

    // Insert record into gallery images table
    const result = await executeQuery(
      `INSERT INTO user_gallery_images (user_id, image_url, privacy_level)
       VALUES ($1, $2, 'members')
       RETURNING id`,
      [userId, blob.url],
    )

    // Revalidate user profile page
    revalidatePath(`/profile/${userId}`)

    return {
      success: true,
      imageUrl: blob.url,
      imageId: result.rows[0].id,
    }
  } catch (error) {
    console.error("Gallery image upload error:", error)
    return {
      success: false,
      error: "Failed to upload gallery image. Please try again.",
    }
  }
}

// Delete gallery image
export async function deleteGalleryImage(userId: string, imageId: string) {
  try {
    // Get the image URL
    const result = await executeQuery("SELECT image_url FROM user_gallery_images WHERE id = $1 AND user_id = $2", [
      imageId,
      userId,
    ])

    if (result.rowCount === 0) {
      return { success: false, error: "Image not found or you do not have permission to delete it." }
    }

    const imageUrl = result.rows[0].image_url

    // Delete from database
    await executeQuery("DELETE FROM user_gallery_images WHERE id = $1 AND user_id = $2", [imageId, userId])

    // Delete from Vercel Blob
    try {
      const urlObj = new URL(imageUrl)
      const pathname = urlObj.pathname.substring(1) // Remove leading slash

      await del(pathname)
    } catch (error) {
      console.error("Failed to delete image from Blob storage:", error)
      // Continue execution even if Blob deletion fails
    }

    // Revalidate user profile page
    revalidatePath(`/profile/${userId}`)

    return { success: true }
  } catch (error) {
    console.error("Delete gallery image error:", error)
    return {
      success: false,
      error: "Failed to delete image. Please try again.",
    }
  }
}

// Get all user images
export async function getUserImages(userId: string) {
  try {
    // First ensure the tables exist
    try {
      // This is a simplified version just to check if the column exists
      await executeQuery(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'profile_image_url'
      `)
    } catch (error) {
      // If there's an error, return empty results
      return {
        success: true,
        profileImage: null,
        galleryImages: [],
      }
    }

    // Get profile image
    const profileResult = await executeQuery("SELECT profile_image_url FROM users WHERE id = $1", [userId])

    // Check if gallery table exists before querying
    let galleryImages = []
    try {
      // Get gallery images
      const galleryResult = await executeQuery(
        `SELECT id, image_url, privacy_level, created_at 
         FROM user_gallery_images 
         WHERE user_id = $1
         ORDER BY created_at DESC`,
        [userId],
      )
      galleryImages = galleryResult.rows || []
    } catch (error) {
      console.error("Gallery table may not exist yet:", error)
    }

    return {
      success: true,
      profileImage: profileResult.rows[0]?.profile_image_url || null,
      galleryImages,
    }
  } catch (error) {
    console.error("Get user images error:", error)
    return {
      success: false,
      error: "Failed to retrieve user images.",
      profileImage: null,
      galleryImages: [],
    }
  }
}
