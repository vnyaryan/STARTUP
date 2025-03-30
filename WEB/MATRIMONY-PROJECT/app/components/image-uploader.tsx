"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export function ImageUploader({ onUploadComplete }: { onUploadComplete?: (url: string) => void }) {
  const [isUploading, setIsUploading] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to upload image")
      }

      const result = await response.json()
      setImageUrl(result.url)

      if (onUploadComplete) {
        onUploadComplete(result.url)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image")
      console.error("Upload error:", err)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          onClick={() => document.getElementById("file-upload")?.click()}
          disabled={isUploading}
          variant="outline"
        >
          {isUploading ? "Uploading..." : "Upload Image"}
        </Button>
        <input id="file-upload" type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {imageUrl && (
        <div className="mt-4">
          <p className="text-sm text-muted-foreground mb-2">Uploaded image:</p>
          <img src={imageUrl || "/placeholder.svg"} alt="Uploaded" className="max-w-full h-auto max-h-64 rounded-md" />
        </div>
      )}
    </div>
  )
}

