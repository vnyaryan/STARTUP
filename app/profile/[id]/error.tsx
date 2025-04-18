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
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white flex items-center justify-center">
      <div className="container mx-auto py-8 px-4 text-center">
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-center text-red-500 mb-4">
            <AlertCircle className="h-12 w-12" />
          </div>

          <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
          <p className="text-gray-600 mb-6">We encountered an error while loading this profile. Please try again.</p>

          <Button onClick={reset} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" /> Try again
          </Button>
        </div>
      </div>
    </div>
  )
}
