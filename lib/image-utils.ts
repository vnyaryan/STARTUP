/**
 * Optimizes an image by resizing and compressing it
 * @param file The image file to optimize
 * @param maxWidth Maximum width of the optimized image
 * @param maxHeight Maximum height of the optimized image
 * @param quality JPEG quality (0-1)
 * @returns A Promise that resolves to the optimized image as a File
 */
export async function optimizeImage(file: File, maxWidth = 800, maxHeight = 800, quality = 0.8): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height)
            height = maxHeight
          }
        }

        // Create canvas and draw resized image
        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")

        if (!ctx) {
          reject(new Error("Could not get canvas context"))
          return
        }

        ctx.drawImage(img, 0, 0, width, height)

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Could not create blob"))
              return
            }

            // Create new file with optimized image
            const optimizedFile = new File([blob], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            })

            resolve(optimizedFile)
          },
          "image/jpeg",
          quality,
        )
      }
      img.onerror = () => {
        reject(new Error("Failed to load image"))
      }
    }
    reader.onerror = () => {
      reject(new Error("Failed to read file"))
    }
  })
}

/**
 * Creates a data URL from a file
 * @param file The file to create a data URL from
 * @returns A Promise that resolves to the data URL
 */
export function createFilePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
