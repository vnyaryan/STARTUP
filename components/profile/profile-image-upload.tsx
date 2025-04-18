"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { uploadProfilePicture } from "@/app/actions/image-upload"
import { Loader2, Upload, User } from "lucide-react"

interface ProfileImageUploadProps {
  userId: string
  existingImageUrl?: string | null
  className?: string
}

export default function ProfileImageUpload({
  userId,
  existingImageUrl = null,
  className = "",
}: ProfileImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(existingImageUrl)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Reset error state
    setError(null)

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file")
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB")
      return
    }

    // Create a preview immediately for better UX
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)

    // Start upload
    setIsUploading(true)

    try {
      const result = await uploadProfilePicture(userId, file)

      if (!result.success) {
        throw new Error(result.error)
      }

      // Update preview with the CDN URL
      setPreview(result.imageUrl)

      // Clean up the object URL
      URL.revokeObjectURL(objectUrl)
    } catch (err) {
      setError("Failed to upload image. Please try again.")
      console.error("Upload error:", err)

      // Revert to previous image if there was one
      setPreview(existingImageUrl)
    } finally {
      setIsUploading(false)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        aria-label="Upload profile picture"
      />

      <div className="relative">
        <Avatar className="w-32 h-32 border-2 border-rose-200">
          <AvatarImage src={preview || ""} alt="Profile picture" />
          <AvatarFallback className="bg-rose-100 text-rose-500">
            {isUploading ? <Loader2 className="h-8 w-8 animate-spin" /> : <User className="h-12 w-12" />}
          </AvatarFallback>
        </Avatar>

        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 rounded-full">
            <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
          </div>
        )}
      </div>

      <Button onClick={triggerFileInput} disabled={isUploading} variant="outline" className="flex gap-2" type="button">
        <Upload className="h-4 w-4" />
        {preview ? "Change Photo" : "Upload Profile Photo"}
      </Button>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <p className="text-gray-500 text-xs text-center">Upload a clear face photo. JPG, PNG or GIF. Max 5MB.</p>
    </div>
  )
}
