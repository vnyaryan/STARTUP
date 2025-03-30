import { ImageUploader } from "@/components/image-uploader"

export default function UploadPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Image Upload</h1>
      <ImageUploader />
    </div>
  )
}

