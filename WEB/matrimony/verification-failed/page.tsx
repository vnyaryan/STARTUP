"use client"

import type React from "react"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useState } from "react"

export default function VerificationFailedPage() {
  const searchParams = useSearchParams()
  const errorType = searchParams.get("error") || "unknown"
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState("")

  let errorMessage = "We could not verify your email."

  switch (errorType) {
    case "missing-token":
      errorMessage = "No verification token was provided."
      break
    case "invalid-token":
      errorMessage = "The verification token is invalid."
      break
    case "expired-token":
      errorMessage = "The verification token has expired."
      break
    case "server-error":
      errorMessage = "A server error occurred during verification."
      break
  }

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      setMessage("Please enter your email address.")
      return
    }

    setIsSubmitting(true)
    setMessage("")

    try {
      const response = await fetch("/api/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage("Verification email sent! Please check your inbox.")
      } else {
        setMessage(data.error || "Failed to send verification email.")
      }
    } catch (error) {
      setMessage("An error occurred. Please try again later.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md text-center">
        <div className="mb-6 text-red-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h2 className="text-2xl font-semibold mb-4">Verification Failed</h2>

        <p className="mb-6 text-gray-600">{errorMessage}</p>

        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Resend Verification Email</h3>
          <form onSubmit={handleResendVerification} className="space-y-4">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:bg-blue-300"
            >
              {isSubmitting ? "Sending..." : "Resend Verification Email"}
            </button>

            {message && (
              <p className={`text-sm ${message.includes("sent") ? "text-green-600" : "text-red-600"}`}>{message}</p>
            )}
          </form>
        </div>

        <div className="flex justify-center space-x-4">
          <Link href="/login" className="text-blue-500 hover:underline">
            Return to Login
          </Link>
          <Link href="/signup" className="text-blue-500 hover:underline">
            Create New Account
          </Link>
        </div>
      </div>
    </div>
  )
}

