"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { CalendarIcon, Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { createUser } from "@/app/actions/user"
import Link from "next/link"
import ImageUpload from "@/components/shared/image-upload"
import { uploadTempProfilePicture } from "@/app/actions/image-upload"
import { optimizeImage } from "@/lib/image-utils"

// Define form schema with validation
const formSchema = z
  .object({
    email: z.string().email({ message: "Please enter a valid email address" }),
    username: z
      .string()
      .min(3, { message: "Username must be at least 3 characters" })
      .max(50, { message: "Username must not exceed 50 characters" })
      .regex(/^[a-zA-Z0-9_]+$/, {
        message: "Username can only contain letters, numbers, and underscores",
      }),
    dateOfBirth: z.string().refine(
      (date) => {
        // Check if the date is valid
        const parsedDate = new Date(date)
        if (isNaN(parsedDate.getTime())) return false

        // Check if the user is at least 18 years old
        const today = new Date()
        const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
        return parsedDate <= eighteenYearsAgo
      },
      { message: "You must be at least 18 years old" },
    ),
    gender: z.enum(["male", "female", "other"], {
      required_error: "Please select a gender",
    }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
      .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
      .regex(/[0-9]/, { message: "Password must contain at least one number" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type FormValues = z.infer<typeof formSchema>

export default function SignupForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null)
  const [imageUploadError, setImageUploadError] = useState<string | null>(null)
  const [emailVerificationSent, setEmailVerificationSent] = useState(false)
  const [userEmail, setUserEmail] = useState<string>("")

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      username: "",
      dateOfBirth: "",
      gender: undefined,
      password: "",
      confirmPassword: "",
    },
  })

  // Handle profile image selection
  const handleImageSelect = async (file: File) => {
    try {
      setImageUploadError(null)

      // Optimize the image
      const optimizedImage = await optimizeImage(file, 400, 400, 0.8)

      // Upload to temporary storage
      const result = await uploadTempProfilePicture(optimizedImage)

      if (result.success) {
        setProfileImage(file)
        setProfileImageUrl(result.imageUrl)
      } else {
        setImageUploadError(result.error || "Failed to upload image")
      }
    } catch (error) {
      console.error("Image processing error:", error)
      setImageUploadError("Failed to process image. Please try again.")
    }
  }

  // Handle image clear
  const handleImageClear = () => {
    setProfileImage(null)
    setProfileImageUrl(null)
  }

  // Handle form submission
  async function onSubmit(data: FormValues) {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // Save email for verification message
      setUserEmail(data.email)

      // Convert string date to Date object for the server action
      const formattedData = {
        ...data,
        dateOfBirth: new Date(data.dateOfBirth),
        profileImageUrl: profileImageUrl,
      }

      const result = await createUser(formattedData)

      if (result.success) {
        setSubmitSuccess(true)
        setEmailVerificationSent(result.emailSent || false)

        // If email wasn't sent successfully, show the error
        if (!result.emailSent && result.emailError) {
          setSubmitError(result.emailError)
        }
      } else {
        setSubmitError(result.error || "An error occurred during signup")
      }
    } catch (error) {
      setSubmitError("An unexpected error occurred. Please try again.")
      console.error("Signup error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Calculate max date (18 years ago)
  const maxDate = new Date()
  maxDate.setFullYear(maxDate.getFullYear() - 18)
  const maxDateString = maxDate.toISOString().split("T")[0]

  return (
    <div className="space-y-6">
      {submitSuccess ? (
        <Alert className="bg-green-50 border-green-500">
          <AlertTitle className="text-green-800">Account Created Successfully!</AlertTitle>
          <AlertDescription className="text-green-700">
            {emailVerificationSent ? (
              <>
                <p className="mb-2">
                  We've sent a verification email to <strong>{userEmail}</strong>. Please check your inbox and click the
                  verification link to activate your account.
                </p>
                <p>
                  If you don't see the email, please check your spam folder. You'll need to verify your email before you
                  can log in.
                </p>
              </>
            ) : (
              <p>
                Your account has been created, but we couldn't send the verification email. Please try logging in later
                or contact support.
              </p>
            )}
          </AlertDescription>
          <div className="mt-4">
            <Button
              onClick={() => router.push("/login")}
              variant="outline"
              className="bg-white text-green-700 border-green-300 hover:bg-green-50"
            >
              Go to Login
            </Button>
          </div>
        </Alert>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Profile Image Upload */}
            <div className="flex flex-col items-center mb-6">
              <h3 className="text-lg font-medium mb-2">Profile Picture</h3>
              <ImageUpload
                onImageSelect={handleImageSelect}
                onImageClear={handleImageClear}
                existingImageUrl={profileImageUrl}
                disabled={isSubmitting}
              />
              {imageUploadError && <p className="text-red-500 text-sm mt-1">{imageUploadError}</p>}
            </div>

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
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Choose a username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input type="date" max={maxDateString} {...field} />
                      <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 opacity-50" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
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
                      <Input type={showPassword ? "text" : "password"} placeholder="Create a password" {...field} />
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
                  <p className="text-xs text-gray-500 mt-1">
                    Password must be at least 8 characters and include uppercase, lowercase, and numbers.
                  </p>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {submitError && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full bg-rose-500 hover:bg-rose-600" disabled={isSubmitting}>
              {isSubmitting ? "Creating Account..." : "Sign Up"}
            </Button>

            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/login" className="text-rose-500 hover:text-rose-600 font-medium">
                  Log in
                </Link>
              </p>
            </div>
          </form>
        </Form>
      )}
    </div>
  )
}
