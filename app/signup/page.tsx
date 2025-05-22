"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { EyeIcon, EyeOffIcon, ArrowLeftIcon, AlertCircleIcon, DatabaseIcon } from "lucide-react"
import { SuccessMessage } from "@/components/success-message"
import { signupUser } from "../actions/auth-actions"

// Define months outside component to prevent recreation on each render
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

// Environment check for development mode
const isDevelopment = process.env.NODE_ENV === "development"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [day, setDay] = useState("")
  const [month, setMonth] = useState("")
  const [year, setYear] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [diagnosticInfo, setDiagnosticInfo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showDebug, setShowDebug] = useState(false)
  const [days, setDays] = useState<number[]>(Array.from({ length: 31 }, (_, i) => i + 1))
  const router = useRouter()

  // Generate years (100 years from current year)
  const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i)

  // Update days based on selected month and year
  useEffect(() => {
    if (month && year) {
      const monthIndex = months.indexOf(month)
      const daysInMonth = new Date(Number(year), monthIndex + 1, 0).getDate()
      setDays(Array.from({ length: daysInMonth }, (_, i) => i + 1))
    } else {
      setDays(Array.from({ length: 31 }, (_, i) => i + 1))
    }
  }, [month, year])

  // Fetch diagnostic info
  const fetchDiagnosticInfo = async () => {
    if (!isDevelopment) return

    try {
      const response = await fetch("/api/diagnose")
      const data = await response.json()
      setDiagnosticInfo(data)
    } catch (err) {
      console.error("Failed to fetch diagnostic info:", err)
    }
  }

  // Toggle debug info display
  const toggleDebugInfo = async () => {
    if (!showDebug) {
      await fetchDiagnosticInfo()
    }
    setShowDebug(!showDebug)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("email", email)
      formData.append("password", password)
      formData.append("day", day)
      formData.append("month", month)
      formData.append("year", year)

      const result = await signupUser(formData)

      if (result.success) {
        setShowSuccess(true)

        // Only refresh debug info if it's already being shown
        if (showDebug) {
          await fetchDiagnosticInfo()
        }
      } else {
        setError(result.message)

        // Fetch debug info when there's an error in development mode
        if (isDevelopment) {
          await fetchDiagnosticInfo()
          setShowDebug(true)
        }
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      console.error(err)

      // Fetch debug info when there's an error in development mode
      if (isDevelopment) {
        await fetchDiagnosticInfo()
        setShowDebug(true)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleContinue = () => {
    setShowSuccess(false)
    router.push("/")
  }

  const resetDatabase = async () => {
    try {
      setIsLoading(true)
      await fetch("/api/reset-db", { method: "POST" })

      // Refresh diagnostic info
      await fetchDiagnosticInfo()

      setError("Database reset successfully. You can now try signing up again.")
    } catch (err) {
      console.error("Failed to reset database:", err)
      setError("Failed to reset database.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center">
            <Link href="/" className="mr-auto">
              <Button variant="ghost" size="icon">
                <ArrowLeftIcon className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Button>
            </Link>
            {isDevelopment && (
              <Button variant="ghost" size="sm" onClick={toggleDebugInfo} className="text-xs text-gray-500">
                <DatabaseIcon className="h-3 w-3 mr-1" />
                {showDebug ? "Hide Diagnostics" : "Show Diagnostics"}
              </Button>
            )}
          </div>
          <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
          <CardDescription className="text-center">Fill in the details below to create your account</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start mb-4">
              <AlertCircleIcon className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <span>{error}</span>
                {error.includes("already registered") && isDevelopment && (
                  <Button
                    variant="link"
                    className="text-red-700 p-0 h-auto text-sm underline"
                    onClick={resetDatabase}
                    disabled={isLoading}
                  >
                    Reset Database
                  </Button>
                )}
              </div>
            </div>
          )}

          {isDevelopment && showDebug && diagnosticInfo && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md mb-4 text-xs overflow-auto max-h-60">
              <p className="font-bold mb-1">Database Diagnostics:</p>
              <p>Timestamp: {diagnosticInfo.timestamp}</p>
              <p>Database: {diagnosticInfo.database?.name}</p>
              <p>Connection: {diagnosticInfo.database?.connectionTest}</p>
              <p>Table Exists: {diagnosticInfo.database?.tableExists ? "Yes" : "No"}</p>

              {diagnosticInfo.database?.tableStructure?.length > 0 && (
                <div className="mt-1">
                  <p className="font-bold">Table Structure:</p>
                  <ul className="list-disc pl-4">
                    {diagnosticInfo.database.tableStructure.map((col: any, i: number) => (
                      <li key={i}>
                        {col.column_name} ({col.data_type}) {col.is_nullable === "YES" ? "NULL" : "NOT NULL"}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-1">
                <p className="font-bold">Users in Database:</p>
                {diagnosticInfo.users?.length > 0 ? (
                  <ul className="list-disc pl-4">
                    {diagnosticInfo.users.map((email: string, i: number) => (
                      <li key={i}>{email}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No users found</p>
                )}
              </div>

              <p className="mt-1">
                <span className="font-bold">Connection String:</span> {diagnosticInfo.database?.name} (using Vercel
                environment variables)
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 text-gray-400"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                  <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Date of Birth</Label>
              <div className="grid grid-cols-3 gap-2">
                <Select value={day} onValueChange={setDay} required disabled={isLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Day" />
                  </SelectTrigger>
                  <SelectContent>
                    {days.map((d) => (
                      <SelectItem key={d} value={d.toString()}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={month} onValueChange={setMonth} required disabled={isLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={year} onValueChange={setYear} required disabled={isLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((y) => (
                      <SelectItem key={y} value={y.toString()}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" className="w-full mt-6" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Sign Up"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              Login
            </Link>
          </p>
        </CardFooter>
      </Card>

      {showSuccess && (
        <SuccessMessage
          title="Account Created Successfully!"
          message={`Welcome to our platform, ${email}! Your account has been created and stored in our database. You can now log in with your credentials.`}
          onClose={handleContinue}
        />
      )}
    </div>
  )
}
