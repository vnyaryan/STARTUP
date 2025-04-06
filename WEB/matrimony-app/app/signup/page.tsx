/**
 * SignupPage Component - React + shadcn/ui + Tailwind CSS
 *
 *  INPUT:
 * - User enters: username, email, password, date of birth
 *
 *  OUTPUT:
 * - If submitted successfully, a success message is shown with a "Return to Home Page" button
 *
 *  LOGIC:
 * 1. Initialize form fields using `useState` for controlled inputs
 * 2. On input change, update the `formData` state
 * 3. On form submit:
 *    - Prevent default page reload
 *    - Set `formSubmitted` to `true`
 * 4. Conditional rendering:
 *    - If `formSubmitted` is `false`, show the signup form
 *    - If `formSubmitted` is `true`, show the success confirmation screen
 * 5. Uses reusable UI components from `@/components/ui/` (likely shadcn/ui)
 *    - Input: For consistent input styling
 *    - Button: For styled, accessible buttons
 *    - Card: To wrap and layout the form content
 */

/**
 * SignupPage Component - React + shadcn/ui + Tailwind CSS
 *
 * 📥 INPUT:
 * - User enters: username, email, password, date of birth
 *
 * 📤 OUTPUT:
 * - If submitted successfully, a success message is shown with a "Return to Home Page" button
 *
 * ⚙️ LOGIC:
 * 1. Initialize form fields using `useState` for controlled inputs
 * 2. On input change, update the `formData` state
 * 3. On form submit:
 *    - Prevent default page reload
 *    - Set `formSubmitted` to `true`
 * 4. Conditional rendering:
 *    - If `formSubmitted` is `false`, show the signup form
 *    - If `formSubmitted` is `true`, show the success confirmation screen
 * 5. Uses reusable UI components from `@/components/ui/` (likely shadcn/ui)
 *    - Input: For consistent input styling
 *    - Button: For styled, accessible buttons
 *    - Card: To wrap and layout the form content
 */

"use client" 
/**
 * Enables client-side rendering in a Next.js app.
 * Required for using useState, event handlers, etc., on this page.
 */

import type React from "react"
/**
 * Imports React types (like ChangeEvent) for strong TypeScript support.
 * Does not import the full React library — type-only import.
 */

import { useState } from "react"
/**
 * React hook to manage component state, used for:
 * - Tracking form field values
 * - Handling form submission state
 */

import { Button } from "@/components/ui/button"
/**
 * Imports the reusable Button component from your design system (likely shadcn/ui).
 * Provides consistent styling and behavior across all buttons in the app.
 */

import { Input } from "@/components/ui/input"
/**
 * Imports the Input component — a styled input wrapper with Tailwind classes.
 * Helps maintain uniform input field styling across the app.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
/**
 * Imports layout components to structure the form visually.
 * - Card: main wrapper with padding and shadow
 * - CardHeader: optional top section (usually for titles)
 * - CardTitle: styled heading inside CardHeader
 * - CardContent: main content area (form or message)
 */


export default function SignupPage() {
  // Tracks whether the form has been submitted
  const [formSubmitted, setFormSubmitted] = useState(false)

  // Holds the input values for the form
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    dateOfBirth: "",
  })

  // Handles input field changes and updates the corresponding field in formData
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handles form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()               // Prevent page reload
    setFormSubmitted(true)          // Mark form as submitted to show success message
  }

  return (
    // Page wrapper with center alignment and gradient background
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md"> {/* Card container for form or success message */}
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-rose-600">Create Your Account</CardTitle>
        </CardHeader>

        <CardContent>
          {/* Render form if not yet submitted */}
          {!formSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Field */}
              <div className="space-y-2">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full"
                />
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full"
                />
              </div>

              {/* Date of Birth Field */}
              <div className="space-y-2">
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                  Date of Birth
                </label>
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full"
                />
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full bg-rose-600 hover:bg-rose-700 text-white">
                Sign Up
              </Button>
            </form>
          ) : (
            // Show this section after successful form submission
            <div className="text-center py-8 space-y-4">
              {/* Green success icon */}
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
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
                  className="text-green-600"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>

              {/* Success Message */}
              <h3 className="text-xl font-semibold text-gray-900">User registered successfully!</h3>
              <p className="text-gray-600">Thank you for signing up with our matrimony service.</p>

              {/* Redirect Button */}
              <Button asChild className="mt-4 bg-rose-600 hover:bg-rose-700 text-white">
                <a href="/home">Return to Home Page</a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
