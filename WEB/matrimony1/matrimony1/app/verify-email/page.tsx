"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

export default function VerifyEmailPage() {
  const [verificationStatus, setVerificationStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("Verifying your email...")
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  useEffect(() => {
    if (!token) {
      setVerificationStatus("error")
      setMessage("Verification token is missing.")
      return
    }

    async function verifyEmail() {
      try {
        const response = await fetch(`/api/verify-email?token=${token}`)
        const data = await response.json()

        if (response.ok) {
          setVerificationStatus("success")
          setMessage("Your email has been verified successfully!")
          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push("/login")
          }, 3000)
        } else {
          setVerificationStatus("error")
          setMessage(data.error || "Failed to verify email. The token may be invalid or expired.")
        }
      } catch (error) {
        setVerificationStatus("error")
        setMessage("An error occurred during verification.")
      }
    }

    verifyEmail()
  }, [token, router])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-md">
        <h1 className="mb-4 text-center text-2xl font-bold">Email Verification</h1>

        {verificationStatus === "loading" && (
          <div className="flex flex-col items-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
            <p className="text-center text-gray-600">{message}</p>
          </div>
        )}

        {verificationStatus === "success" && (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <p className="mb-4 text-green-600">{message}</p>
            <p className="text-gray-600">Redirecting to login page...</p>
          </div>
        )}

        {verificationStatus === "error" && (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <p className="mb-4 text-red-600">{message}</p>
            <div className="flex flex-col space-y-2">
              <Link href="/login" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                Go to Login
              </Link>
              <Link href="/resend-verification" className="text-sm text-blue-600 hover:underline">
                Resend verification email
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

