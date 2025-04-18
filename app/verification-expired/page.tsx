import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Clock } from "lucide-react"

export default function VerificationExpiredPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <div className="flex flex-col items-center text-center">
          <div className="h-16 w-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
            <Clock className="h-10 w-10 text-amber-600" />
          </div>

          <h1 className="text-2xl font-bold mb-2">Verification Link Expired</h1>

          <p className="text-gray-600 mb-6">
            The verification link has expired. Verification links are valid for 24 hours after they are sent.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild className="bg-rose-500 hover:bg-rose-600">
              <Link href="/login">Go to Login</Link>
            </Button>

            <p className="text-sm text-gray-500 mt-4">You can request a new verification email from the login page.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
