"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Eye, EyeOff, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { loginUser, resendVerificationEmail } from "@/app/actions/user"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User } from "lucide-react"

// Define form schema with validation
const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
})

type FormValues = z.infer<typeof formSchema>

export default function LoginForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [userProfileImage, setUserProfileImage] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [needsVerification, setNeedsVerification] = useState(false)
  const [userEmail, setUserEmail] = useState<string>("")
  const [isResendingEmail, setIsResendingEmail] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [resendError, setResendError] = useState<string | null>(null)

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  // Handle form submission
  async function onSubmit(data: FormValues) {
    setIsSubmitting(true)
    setSubmitError(null)
    setNeedsVerification(false)
    setUserEmail(data.email)

    try {
      const result = await loginUser(data)

      if (result.success) {
        // If login successful, show profile image if available
        if (result.user?.profileImageUrl) {
          setUserProfileImage(result.user.profileImageUrl)
        }
        if (result.user?.username) {
          setUserName(result.user.username)
        }

        // Redirect to dashboard or profile page after a short delay
        setTimeout(() => {
          router.push("/browse")
        }, 1000)
      } else {
        if (result.needsVerification) {
          setNeedsVerification(true)
        } else {
          setSubmitError(result.error || "An error occurred during login")
        }
      }
    } catch (error) {
      setSubmitError("An unexpected error occurred. Please try again.")
      console.error("Login error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle resend verification email
  async function handleResendVerification() {
    setIsResendingEmail(true)
    setResendSuccess(false)
    setResendError(null)

    try {
      const result = await resendVerificationEmail(userEmail)

      if (result.success) {
        setResendSuccess(true)
      } else {
        setResendError(result.error || "Failed to resend verification email")
      }
    } catch (error) {
      setResendError("An unexpected error occurred. Please try again.")
      console.error("Resend verification error:", error)
    } finally {
      setIsResendingEmail(false)
    }
  }

  return (
    <div className="space-y-6">
      {userProfileImage && (
        <div className="flex flex-col items-center space-y-3 py-4 bg-rose-50 rounded-lg">
          <Avatar className="w-24 h-24 border-2 border-rose-200">
            <AvatarImage src={userProfileImage} alt="Profile picture" />
            <AvatarFallback className="bg-rose-100 text-rose-500">
              <User className="h-12 w-12" />
            </AvatarFallback>
          </Avatar>
          <div className="text-center">
            <p className="font-medium text-lg">Welcome back, {userName}!</p>
            <p className="text-sm text-gray-500">Redirecting you to your account...</p>
          </div>
        </div>
      )}

      {needsVerification && (
        <Alert className="bg-amber-50 border-amber-500">
          <AlertTitle className="text-amber-800 flex items-center gap-2">
            <Mail className="h-4 w-4" /> Email Verification Required
          </AlertTitle>
          <AlertDescription className="text-amber-700">
            <p className="mb-2">
              Your email address ({userEmail}) needs to be verified before you can log in. Please check your inbox for a
              verification email.
            </p>
            <p className="mb-4">
              If you don't see the email, check your spam folder or click the button below to resend the verification
              email.
            </p>
            <Button
              onClick={handleResendVerification}
              variant="outline"
              className="bg-white border-amber-300 hover:bg-amber-50"
              disabled={isResendingEmail || resendSuccess}
            >
              {isResendingEmail ? "Sending..." : resendSuccess ? "Email Sent!" : "Resend Verification Email"}
            </Button>
            {resendError && <p className="text-red-500 text-sm mt-2">{resendError}</p>}
            {resendSuccess && (
              <p className="text-green-600 text-sm mt-2">Verification email sent! Please check your inbox.</p>
            )}
          </AlertDescription>
        </Alert>
      )}

      {!userProfileImage && !needsVerification && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input type={showPassword ? "text" : "password"} placeholder="Enter your password" {...field} />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-sm text-rose-500 hover:text-rose-600">
                Forgot password?
              </Link>
            </div>

            {submitError && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full bg-rose-500 hover:bg-rose-600" disabled={isSubmitting}>
              {isSubmitting ? "Logging in..." : "Log In"}
            </Button>

            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link href="/signup" className="text-rose-500 hover:text-rose-600 font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </form>
        </Form>
      )}
    </div>
  )
}
