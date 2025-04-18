"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Upload, User, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
  onImageSelect: (file: File) => void
  onImageClear?: () => void
  existingImageUrl?: string | null
  className?: string
  size?: "sm" | "md" | "lg"
  showRemoveButton?: boolean
  disabled?: boolean
}

export default function ImageUpload({
  onImageSelect,
  onImageClear,
  existingImageUrl = null,
  className = "",
  size = "md",
  showRemoveButton = true,
  disabled = false,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(existingImageUrl)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Size mappings
  const sizeClasses = {
    sm: "w-20 h-20",
    md: "w-32 h-32",
    lg: "w-40 h-40",
  }

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

    // Call the parent handler
    setIsLoading(true)
    try {
      await onImageSelect(file)
    } catch (err) {
      setError("Failed to process image. Please try again.")
      console.error("Image processing error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleRemoveImage = () => {
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    if (onImageClear) {
      onImageClear()
    }
  }

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        aria-label="Upload profile picture"
        disabled={disabled}
      />

      <div className="relative">
        <Avatar className={cn("border-2 border-rose-200", sizeClasses[size])}>
          <AvatarImage src={preview || ""} alt="Profile picture" />
          <AvatarFallback className="bg-rose-100 text-rose-500">
            {isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : <User className="h-12 w-12" />}
          </AvatarFallback>
        </Avatar>

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 rounded-full">
            <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
          </div>
        )}

        {preview && showRemoveButton && (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
            onClick={handleRemoveImage}
            disabled={disabled}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      <Button
        onClick={triggerFileInput}
        disabled={disabled || isLoading}
        variant="outline"
        className="flex gap-2"
        type="button"
        size="sm"
      >
        <Upload className="h-4 w-4" />
        {preview ? "Change Photo" : "Upload Photo"}
      </Button>

      {error && <p className="text-red-500 text-xs">{error}</p>}

      <p className="text-gray-500 text-xs text-center">JPG, PNG or GIF. Max 5MB.</p>
    </div>
  )
}
