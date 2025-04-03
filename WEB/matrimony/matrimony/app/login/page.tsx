"use client"
/**
 * Summary of LoginPage Component:
 *
 * - This is a client-side login page built with React and Next.js.
 *
 * ✅ State Management:
 * - `email`, `password`: User credentials.
 * - `rememberMe`: Checkbox state for remembering login.
 * - `error`: Stores any login error messages.
 * - `loading`: Indicates if a login or resend request is in progress.
 * - `needsVerification`: Set when login fails due to unverified email.
 * - `verificationSent`: Indicates whether the verification email has been resent.
 *
 * ✅ Core Features:
 * 1. **Login Form Submission (`handleSubmit`)**:
 *    - Prevents default form submission.
 *    - Sends POST request to `/api/login` with user credentials.
 *    - If login is successful → redirects to `/home`.
 *    - If email is unverified → shows prompt and resend option.
 *    - Handles and displays error messages gracefully.
 *
 * 2. **Email Verification Resend (`handleResendVerification`)**:
 *    - Sends POST request to `/api/resend-verification`.
 *    - On success → shows confirmation message.
 *    - Handles any errors with appropriate feedback.
 *
 * ✅ UI Elements:
 * - Styled with Tailwind CSS.
 * - Responsive form with fields for email, password, "remember me" checkbox, and buttons.
 * - Displays environment-specific notes in **development mode**, including instructions related to email verification using **Resend** (email service).
 *
 * ✅ Navigation:
 * - Uses `useRouter` from `next/navigation` to programmatically redirect users after successful login.
 *
 * ✅ Developer Notes (in dev mode):
 * - Email is sent to `delivered@resend.dev` in dev.
 * - Server logs contain actual verification links.
 */

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [needsVerification, setNeedsVerification] = useState(false)
  const [verificationSent, setVerificationSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    console.log("Login attempt with:", { email }) // Don't log password for security

    try {
      console.log("Sending login request...")
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      console.log("Login response status:", response.status)
      const data = await response.json()
      console.log("Login response data:", data)

      if (response.ok) {
        // Successful login
        console.log("Login successful, redirecting to homepage")
        router.push("/home")
        router.refresh()
      } else if (response.status === 403 && data.needsVerification) {
        // Email not verified
        console.log("Email not verified")
        setNeedsVerification(true)
      } else {
        // Other errors
        console.log("Login failed:", data.error)
        setError(data.error || "Login failed")
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("An error occurred during login")
    } finally {
      setLoading(false)
    }
  }

  const handleResendVerification = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setError("")
        setVerificationSent(true)
      } else {
        setError(data.error || "Failed to resend verification email")
      }
    } catch (err) {
      setError("An error occurred while resending verification email")
      console.error("Resend verification error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-6 text-center">Login</h2>

        {needsVerification && (
          <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
            <p>Your email is not verified.</p>
            <p className="mt-2">
              Please check your inbox for the verification email or{" "}
              <button
                onClick={handleResendVerification}
                className="text-blue-500 hover:underline focus:outline-none"
                disabled={loading || verificationSent}
              >
                click here
              </button>{" "}
              to resend it.
            </p>
            {verificationSent && (
              <p className="mt-2 text-green-600">Verification email sent! Please check your inbox.</p>
            )}
            {process.env.NODE_ENV !== "production" && (
              <p className="mt-2 text-sm text-gray-600">
                <strong>Development Note:</strong> In development mode, emails are sent to Resend's test email address
                (delivered@resend.dev). Check your server logs for verification links.
              </p>
            )}
          </div>
        )}

        {error && !needsVerification && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>
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

          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember-me"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>

            <Link href="/forgot-password" className="text-sm text-blue-500 hover:underline">
              Forgot your password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:bg-blue-300"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p>
            Don't have an account?{" "}
            <Link href="/signup" className="text-blue-500 hover:underline">
              Sign up
            </Link>
          </p>
        </div>

        {process.env.NODE_ENV !== "production" && (
          <div className="mt-6 p-3 bg-gray-100 rounded text-sm text-gray-600">
            <p className="font-semibold">Development Mode Notes:</p>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>Email verification is using Resend's test email system</li>
              <li>Check your server logs for verification links</li>
              <li>All emails are sent to delivered@resend.dev instead of actual recipients</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

