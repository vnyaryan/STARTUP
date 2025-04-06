"use client"

import { useState } from "react"
import SignupForm from "@/components/signup-form"
import SuccessMessage from "@/components/success-message"

export default function SignupPage() {
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    // Simulate form submission
    // In a real app, this would call a server action to handle the data
    console.log("Form submitted with data:", {
      email: formData.get("email"),
      name: formData.get("name"),
      dob: formData.get("dob"),
      gender: formData.get("gender"),
    })

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Show success message
    setIsSuccess(true)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        {!isSuccess ? (
          <>
            <h1 className="mb-6 text-2xl font-bold text-center">Create an Account</h1>
            <SignupForm onSubmit={handleSubmit} />
          </>
        ) : (
          <SuccessMessage />
        )}
      </div>
    </div>
  )
}

