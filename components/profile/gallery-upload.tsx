"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { uploadGalleryImage, deleteGalleryImage } from "@/app/actions/image-upload"
import { Loader2, Plus, Trash2, AlertCircle } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface GalleryImage {
  id: string
  image_url: string
  privacy_level: string
  created_at: string
}

interface GalleryUploadProps {
  userId: string
  initialImages?: GalleryImage[]
  maxImages?: number
}

export default function GalleryUpload({ userId, initialImages = [], maxImages = 6 }: GalleryUploadProps) {
  const [images, setImages] = useState<GalleryImage[]>(initialImages)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageToDelete, setImageToDelete] = useState<string | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Reset error
    setError(null)

    // Check if max images reached
    if (images.length >= maxImages) {
      setError(`You can only upload a maximum of ${maxImages} images`)
      return
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file")
      return
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be less than 10MB")
      return
    }

    // Start upload
    setIsUploading(true)

    try {
      const result = await uploadGalleryImage(userId, file)

      if (!result.success) {
        throw new Error(result.error)
      }

      // Add new image to the list
      setImages([
        ...images,
        {
          id: result.imageId,
          image_url: result.imageUrl,
          privacy_level: "members",
          created_at: new Date().toISOString(),
        },
      ])
    } catch (err) {
      setError("Failed to upload image. Please try again.")
      console.error("Upload error:", err)
    } finally {
      setIsUploading(false)

      // Reset the file input
      e.target.value = ""
    }
  }

  const confirmDeleteImage = (imageId: string) => {
    setImageToDelete(imageId)
  }

  const handleDeleteImage = async () => {
    if (!imageToDelete) return

    try {
      const result = await deleteGalleryImage(userId, imageToDelete)

      if (result.success) {
        // Remove image from the list
        setImages(images.filter((img) => img.id !== imageToDelete))
      } else {
        setError("Failed to delete image")
      }
    } catch (err) {
      setError("Failed to delete image. Please try again.")
      console.error("Delete error:", err)
    } finally {
      setImageToDelete(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Photo Gallery</h3>
        <p className="text-sm text-gray-500">
          {images.length} of {maxImages} photos
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((image) => (
          <div key={image.id} className="relative aspect-square rounded-md overflow-hidden group">
            <Image
              src={image.image_url || "/placeholder.svg"}
              alt="Gallery image"
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200" />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => confirmDeleteImage(image.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {/* Upload button */}
        {images.length < maxImages && (
          <label className="relative aspect-square rounded-md border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-rose-300 transition-colors">
            <input
              type="file"
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              disabled={isUploading}
            />
            <div className="flex flex-col items-center">
              {isUploading ? (
                <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
              ) : (
                <>
                  <Plus className="h-8 w-8 text-gray-400" />
                  <span className="text-sm text-gray-500 mt-1">Add Photo</span>
                </>
              )}
            </div>
          </label>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-500 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      <p className="text-gray-500 text-xs">Upload photos that represent you. JPG, PNG or GIF. Max 10MB per image.</p>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!imageToDelete} onOpenChange={(open) => !open && setImageToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Image</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this image? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteImage} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
