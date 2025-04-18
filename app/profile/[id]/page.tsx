import { notFound } from "next/navigation"
import { executeQuery } from "@/lib/db"
import ProfileImageUpload from "@/components/profile/profile-image-upload"
import GalleryUpload from "@/components/profile/gallery-upload"
import { getUserImages } from "@/app/actions/image-upload"
import { setupImageTables } from "@/app/actions/db-setup"

interface ProfilePageProps {
  params: {
    id: string
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const userId = params.id

  // Ensure the image tables exist before querying
  try {
    await setupImageTables()
  } catch (error) {
    console.error("Error setting up image tables:", error)
  }

  // Fetch user data
  const userResult = await executeQuery("SELECT id, username, email FROM users WHERE id = $1", [userId])

  if (userResult.rowCount === 0) {
    notFound()
  }

  const user = userResult.rows[0]

  // Fetch user images
  const imagesResult = await getUserImages(userId)
  const galleryImages = imagesResult.success ? imagesResult.galleryImages : []
  const profileImageUrl = imagesResult.success ? imagesResult.profileImage : null

  // Add profile image URL to user object
  user.profile_image_url = profileImageUrl

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      {/* Header - Reusing the same header from layout */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-rose-500"
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
          <h1 className="text-2xl font-bold text-gray-800">Forever Match</h1>
        </div>
      </header>

      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">My Profile</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left column - Profile image */}
            <div className="md:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <ProfileImageUpload userId={userId} existingImageUrl={user.profile_image_url} />

                <div className="mt-6 text-center">
                  <h2 className="text-xl font-semibold">{user.username}</h2>
                  <p className="text-gray-500">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Right column - Gallery */}
            <div className="md:col-span-2">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <GalleryUpload userId={userId} initialImages={galleryImages} maxImages={6} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-4 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p>© {new Date().getFullYear()} Forever Match. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
