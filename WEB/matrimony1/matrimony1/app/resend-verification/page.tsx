"use client"


/**
 * Summary of ResendVerificationPage Component:
 *
 * - This is a client-side component used to resend a verification email to users.
 *
 * ✅ State Management:
 * - `email`: Stores the user's email input.
 * - `status`: Tracks the submission status - can be "idle", "loading", "success", or "error".
 * - `message`: Displays success or error messages returned from the server.
 *
 * ✅ Core Functionality:
 * - On form submission (`handleSubmit`):
 *    - Sends a POST request to `/api/resend-verification` with the provided email.
 *    - Displays a success message if the response is OK.
 *    - Otherwise, shows an appropriate error message.
 *    - Includes try-catch for handling unexpected errors.
 *
 * ✅ UI Feedback:
 * - Success: Shows a green alert with instructions to check the inbox/spam folder.
 * - Error: Shows a red alert with the failure reason.
 * - Button text changes based on loading state to give real-time feedback.
 *
 * ✅ Navigation:
 * - A link is provided to navigate back to the login page.
 *
 * ✅ Styling:
 * - Responsive layout using Tailwind CSS.
 * - Form is centered with visual cues for success and error states.
 *
 * ✅ Use Case:
 * - Helpful for users who did not receive or lost their original verification email.
 * - Common in email verification flows in authentication systems.
 */
import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function ResendVerificationPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("loading")

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
        setStatus("success")
        setMessage(data.message || "Verification email sent successfully!")
      } else {
        setStatus("error")
        setMessage(data.error || "Failed to send verification email.")
      }
    } catch (error) {
      setStatus("error")
      setMessage("An error occurred while sending the verification email.")
      console.error("Resend verification error:", error)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-6 text-center">Resend Verification Email</h2>

        {status === "success" && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            <p>{message}</p>
            <p className="mt-2 text-sm">Please check your inbox and spam folder for the verification email.</p>
          </div>
        )}

        {status === "error" && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            <p>{message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:bg-blue-300"
          >
            {status === "loading" ? "Sending..." : "Resend Verification Email"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link href="/login" className="text-blue-500 hover:underline">
            Return to login
          </Link>
        </div>
      </div>
    </div>
  )
}

