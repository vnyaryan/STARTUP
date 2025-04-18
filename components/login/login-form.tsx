"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Eye, EyeOff, Mail, Lock, AlertCircle, Loader2, CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { loginUser, resendVerificationEmail } from "@/app/actions/user"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

// Define form schema with validation
const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
  rememberMe: z.boolean().optional(),
})

type FormValues = z.infer<typeof formSchema>

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get("redirect") || "/profile"

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
  const [loginSuccess, setLoginSuccess] = useState(false)

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  })

  // Check for verification success message in URL
  useEffect(() => {
    const verified = searchParams.get("verified")
    if (verified === "true") {
      setSubmitError(null)
      setLoginSuccess(true)
    }
  }, [searchParams])

  // Handle form submission
  async function onSubmit(data: FormValues) {
    setIsSubmitting(true)
    setSubmitError(null)
    setNeedsVerification(false)
    setUserEmail(data.email)
    setLoginSuccess(false)

    try {
      const result = await loginUser({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      })

      if (result.success) {
        // If login successful, show profile image if available
        if (result.user?.profileImageUrl) {
          setUserProfileImage(result.user.profileImageUrl)
        }
        if (result.user?.username) {
          setUserName(result.user.username)
        }

        setLoginSuccess(true)

        // Redirect to dashboard or profile page after a short delay
        setTimeout(() => {
          router.push(redirectUrl)
        }, 1500)
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
      {loginSuccess && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <CardTitle className="text-green-700">Login Successful</CardTitle>
            </div>
            <CardDescription className="text-green-600">
              You have successfully logged in to your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-3 py-4">
              <Avatar className="w-20 h-20 border-2 border-green-200">
                <AvatarImage src={userProfileImage || ""} alt="Profile picture" />
                <AvatarFallback className="bg-green-100 text-green-500">
                  <User className="h-10 w-10" />
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <p className="font-medium text-lg text-green-700">Welcome back, {userName || "User"}!</p>
                <p className="text-sm text-green-600">Redirecting you to your account...</p>
              </div>
            </div>
          </CardContent>
        </Card>
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
              {isResendingEmail ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                </>
              ) : resendSuccess ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Email Sent!
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" /> Resend Verification Email
                </>
              )}
            </Button>
            {resendError && (
              <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {resendError}
              </p>
            )}
            {resendSuccess && (
              <p className="text-green-600 text-sm mt-2 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Verification email sent! Please check your inbox.
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}

      {!loginSuccess && !needsVerification && (
        <Card>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input placeholder="Enter your email" className="pl-10" {...field} autoComplete="email" />
                        </div>
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
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            className="pl-10"
                            {...field}
                            autoComplete="current-password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-between">
                  <FormField
                    control={form.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <div className="flex items-center space-x-2">
                        <Checkbox id="rememberMe" checked={field.value} onCheckedChange={field.onChange} />
                        <label
                          htmlFor="rememberMe"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Remember me
                        </label>
                      </div>
                    )}
                  />
                  <Link href="/forgot-password" className="text-sm text-rose-500 hover:text-rose-600 font-medium">
                    Forgot password?
                  </Link>
                </div>

                {submitError && (
                  <Alert variant="destructive" className="py-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle className="ml-2">{submitError}</AlertTitle>
                  </Alert>
                )}

                <Button type="submit" className="w-full bg-rose-500 hover:bg-rose-600" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in...
                    </>
                  ) : (
                    "Log In"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 border-t pt-6 pb-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link href="/signup" className="text-rose-500 hover:text-rose-600 font-medium">
                  Sign up
                </Link>
              </p>
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or continue with</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="w-full">
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </Button>
              <Button variant="outline" className="w-full">
                <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
                Facebook
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
