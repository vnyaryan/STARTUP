"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface User {
  id: string
  name: string
  email: string
  gender?: string
  dob?: string
}

export default function HomePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/user")

        if (!response.ok) {
          if (response.status === 401) {
            // Not authenticated
            router.push("/login")
            return
          }
          throw new Error("Failed to fetch user data")
        }

        const data = await response.json()
        setUser(data.user)
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [router])

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/logout", {
        method: "POST",
      })

      if (response.ok) {
        router.push("/login")
      }
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Matrimony</h1>
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Welcome to Matrimony, {user?.name}!</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-blue-50 p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-blue-800 mb-3">Find Your Perfect Match</h3>
              <p className="text-gray-600 mb-4">
                Browse through profiles of potential matches based on your preferences and interests.
              </p>
              <Link
                href="/matches"
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Explore Matches
              </Link>
            </div>

            <div className="bg-purple-50 p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-purple-800 mb-3">Complete Your Profile</h3>
              <p className="text-gray-600 mb-4">
                Add more details to your profile to increase your chances of finding the right match.
              </p>
              <Link
                href="/profile"
                className="inline-block bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
              >
                Update Profile
              </Link>
            </div>
          </div>

          <div className="mt-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium mb-3">Recent Activity</h3>
            <p className="text-gray-500 italic">No recent activity to display.</p>
          </div>
        </div>
      </main>

      <footer className="bg-white shadow-inner mt-8 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500">© 2024 Matrimony. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

