"use client"

import type React from "react"

import { useState, useRef, type ChangeEvent } from "react"
import Image from "next/image"
import { Camera } from "lucide-react"

interface ImageUploadProps {
  onImageSelect: (file: File) => void
  previewUrl: string | null
  className?: string
}

export default function ImageUpload({ onImageSelect, previewUrl, className = "" }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      onImageSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onImageSelect(e.dataTransfer.files[0])
    }
  }

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className={`w-full ${className}`}>
      <div
        className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 transition-colors ${
          isDragging ? "border-primary bg-primary/10" : "border-gray-300 hover:border-primary"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        {previewUrl ? (
          <div className="relative w-32 h-32 mb-4">
            <Image
              src={previewUrl || "/placeholder.svg"}
              alt="Profile preview"
              fill
              className="rounded-full object-cover"
            />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
            <Camera size={32} className="text-muted-foreground" />
          </div>
        )}

        <p className="text-sm text-muted-foreground mb-2">
          {previewUrl ? "Click to change photo" : "Click to upload or drag and drop"}
        </p>
        <p className="text-xs text-muted-foreground">JPG, PNG or GIF (max. 5MB)</p>

        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
      </div>
    </div>
  )
}

