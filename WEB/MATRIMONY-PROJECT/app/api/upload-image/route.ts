import { type NextRequest, NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import { join } from "path"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed." },
        { status: 400 },
      )
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size exceeds 5MB limit" }, { status: 400 })
    }

    // Create unique filename
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate a unique filename with original extension
    const originalName = file.name
    const extension = originalName.split(".").pop()
    const filename = `${uuidv4()}.${extension}`

    // Ensure directory exists
    const uploadDir = join(process.cwd(), "public/uploads")

    try {
      // Write file to the public/uploads directory
      const filePath = join(uploadDir, filename)
      await writeFile(filePath, buffer)

      // Return the URL to the uploaded file
      const fileUrl = `/uploads/${filename}`

      return NextResponse.json({
        message: "File uploaded successfully",
        url: fileUrl,
      })
    } catch (writeError) {
      console.error("Error writing file:", writeError)

      // If there's an error writing to the filesystem, try an alternative approach
      // This could be uploading to a cloud storage service instead

      return NextResponse.json({ error: "Failed to save file. Please try again." }, { status: 500 })
    }
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Failed to process upload" }, { status: 500 })
  }
}

