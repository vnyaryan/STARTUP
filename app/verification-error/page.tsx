import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function VerificationErrorPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <div className="flex flex-col items-center text-center">
          <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-10 w-10 text-red-600" />
          </div>

          <h1 className="text-2xl font-bold mb-2">Verification Failed</h1>

          <p className="text-gray-600 mb-6">
            We couldn't verify your email address. The verification link may be invalid or has already been used.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild className="bg-rose-500 hover:bg-rose-600">
              <Link href="/login">Go to Login</Link>
            </Button>

            <Button asChild variant="outline">
              <Link href="/contact">Contact Support</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
