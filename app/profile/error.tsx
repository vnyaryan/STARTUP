"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw } from "lucide-react"

export default function ProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Profile page error:", error)
  }, [error])

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <div className="flex items-center justify-center text-red-500 mb-4">
          <AlertCircle className="h-12 w-12" />
        </div>

        <h2 className="text-2xl font-bold mb-4 text-center">Something went wrong</h2>
        <p className="text-gray-600 mb-6">
          We encountered an error while loading your profile. Please try again or contact support if the problem
          persists.
        </p>

        <div className="bg-red-50 border border-red-200 rounded p-4 mb-6 text-sm text-red-800">
          {error.message || "An unexpected error occurred"}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={reset} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" /> Try again
          </Button>
          <Button variant="outline" asChild>
            <a href="/">Return to Home</a>
          </Button>
        </div>
      </div>
    </div>
  )
}
