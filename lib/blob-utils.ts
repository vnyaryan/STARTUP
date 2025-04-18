import { list, del } from "@vercel/blob"
import { executeQuery } from "@/lib/db"

// Delete unused blobs (e.g., during account deletion)
export async function deleteUserBlobs(userId: string) {
  try {
    // List all blobs for this user
    const profileBlobs = await list({ prefix: `profiles/${userId}/` })
    const galleryBlobs = await list({ prefix: `gallery/${userId}/` })

    // Delete all profile blobs
    for (const blob of profileBlobs.blobs) {
      await del(blob.pathname)
    }

    // Delete all gallery blobs
    for (const blob of galleryBlobs.blobs) {
      await del(blob.pathname)
    }

    return { success: true }
  } catch (error) {
    console.error("Failed to delete user blobs:", error)
    return { success: false, error: "Failed to delete user files" }
  }
}

// Clean up orphaned blobs (maintenance task)
export async function cleanupOrphanedBlobs() {
  try {
    // Get all blobs
    const allBlobs = await list()
    let deletedCount = 0

    for (const blob of allBlobs.blobs) {
      // Skip non-user content
      if (!blob.pathname.startsWith("profiles/") && !blob.pathname.startsWith("gallery/")) {
        continue
      }

      // Extract user ID from pathname
      const pathParts = blob.pathname.split("/")
      if (pathParts.length < 2) continue

      const userId = pathParts[1]

      // Check if user exists
      const userResult = await executeQuery("SELECT id FROM users WHERE id = $1", [userId])

      // If user doesn't exist, delete the blob
      if (userResult.rowCount === 0) {
        await del(blob.pathname)
        deletedCount++
      }
    }

    return { success: true, deletedCount }
  } catch (error) {
    console.error("Failed to cleanup orphaned blobs:", error)
    return { success: false, error: "Failed to cleanup orphaned files" }
  }
}
