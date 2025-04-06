import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

export default function SuccessMessage() {
  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-6 text-center">
      <CheckCircle className="w-16 h-16 text-green-500" />

      <div className="space-y-2">
        <h2 className="text-2xl font-bold">User registered successfully</h2>
        <p className="text-gray-600">Thank you for signing up! Your account has been created.</p>
      </div>

      <Link href="/">
        <Button>Back to Home Page</Button>
      </Link>
    </div>
  )
}

