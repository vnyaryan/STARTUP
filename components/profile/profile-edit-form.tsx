"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { updateUserProfile } from "@/app/actions/profile"
import ImageUpload from "@/components/shared/image-upload"
import { uploadProfilePicture } from "@/app/actions/image-upload"

// Define form schema with validation
const formSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters" })
    .max(50, { message: "Username must not exceed 50 characters" })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "Username can only contain letters, numbers, and underscores",
    }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  gender: z.enum(["male", "female", "other"], {
    required_error: "Please select a gender",
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
})

type FormValues = z.infer<typeof formSchema>

interface ProfileEditFormProps {
  user: {
    id: string
    username: string
    email: string
    gender: string
    dateOfBirth: string
    profileImageUrl: string | null
  }
  onCancel: () => void
}

export default function ProfileEditForm({ user, onCancel }: ProfileEditFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [imageUploadError, setImageUploadError] = useState<string | null>(null)
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(user.profileImageUrl)

  // Format date for input field (YYYY-MM-DD)
  const formattedDate = new Date(user.dateOfBirth).toISOString().split("T")[0]

  // Initialize form with user data
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: user.username,
      email: user.email,
      gender: user.gender as "male" | "female" | "other",
      dateOfBirth: formattedDate,
    },
  })

  // Handle profile image upload
  const handleImageSelect = async (file: File) => {
    try {
      setImageUploadError(null)

      const result = await uploadProfilePicture(user.id, file)

      if (result.success) {
        setProfileImageUrl(result.imageUrl)
      } else {
        setImageUploadError(result.error || "Failed to upload image")
      }
    } catch (error) {
      console.error("Image upload error:", error)
      setImageUploadError("Failed to upload image. Please try again.")
    }
  }

  // Handle form submission
  async function onSubmit(data: FormValues) {
    setIsSubmitting(true)
    setSubmitError(null)
    setSubmitSuccess(false)

    try {
      const result = await updateUserProfile({
        userId: user.id,
        username: data.username,
        email: data.email,
        gender: data.gender,
        dateOfBirth: new Date(data.dateOfBirth),
      })

      if (result.success) {
        setSubmitSuccess(true)

        // Refresh the page after a short delay
        setTimeout(() => {
          router.refresh()
          onCancel()
        }, 1500)
      } else {
        setSubmitError(result.error || "Failed to update profile")
      }
    } catch (error) {
      console.error("Profile update error:", error)
      setSubmitError("An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Calculate max date (18 years ago)
  const maxDate = new Date()
  maxDate.setFullYear(maxDate.getFullYear() - 18)
  const maxDateString = maxDate.toISOString().split("T")[0]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
        <CardDescription>Update your personal information</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column - Profile image */}
          <div className="md:col-span-1">
            <div className="flex flex-col items-center">
              <ImageUpload
                onImageSelect={handleImageSelect}
                existingImageUrl={profileImageUrl}
                className="mb-4"
                size="lg"
                disabled={isSubmitting}
              />

              {imageUploadError && <p className="text-red-500 text-sm mt-1">{imageUploadError}</p>}
            </div>
          </div>

          {/* Right column - Form fields */}
          <div className="md:col-span-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>This is your public display name.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>Changing your email will require re-verification.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <Input type="date" max={maxDateString} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {submitError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle className="ml-2">Error</AlertTitle>
                    <AlertDescription>{submitError}</AlertDescription>
                  </Alert>
                )}

                {submitSuccess && (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertTitle className="ml-2 text-green-800">Success</AlertTitle>
                    <AlertDescription className="text-green-700">
                      Your profile has been updated successfully.
                    </AlertDescription>
                  </Alert>
                )}
              </form>
            </Form>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-4">
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button onClick={form.handleSubmit(onSubmit)} className="bg-rose-500 hover:bg-rose-600" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
