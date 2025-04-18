"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  username: string
  email: string
  role?: string
  profileImageUrl?: string | null
}

interface AuthContextType {
  user: User | null
  loading: boolean
  logout: () => Promise<void>
  updateProfileImage: (imageUrl: string) => void
  refreshUserData: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Function to fetch user data
  const fetchUserData = async () => {
    try {
      console.log("AuthContext: Fetching user data from API")
      const res = await fetch("/api/auth/me", {
        // Add cache: 'no-store' to prevent caching
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      console.log("AuthContext: API response status:", res.status)

      if (res.ok) {
        const data = await res.json()
        console.log("AuthContext: User data received:", data)
        setUser(data.user)
      } else {
        console.log("AuthContext: Failed to fetch user data, status:", res.status)
        setUser(null)
      }
    } catch (error) {
      console.error("AuthContext: Error fetching user:", error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  // Initial data fetch
  useEffect(() => {
    fetchUserData()
  }, [])

  // Function to refresh user data
  const refreshUserData = async () => {
    setLoading(true)
    await fetchUserData()
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      })
      setUser(null)
      router.push("/login")
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  const updateProfileImage = (imageUrl: string) => {
    if (user) {
      setUser({
        ...user,
        profileImageUrl: imageUrl,
      })
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout, updateProfileImage, refreshUserData }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
