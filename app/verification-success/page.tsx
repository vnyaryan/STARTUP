import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

export default function VerificationSuccessPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <div className="flex flex-col items-center text-center">
          <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>

          <h1 className="text-2xl font-bold mb-2">Email Verified Successfully!</h1>

          <p className="text-gray-600 mb-6">
            Your email has been verified and your account is now active. You can now use all the features of Forever
            Match.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild className="bg-rose-500 hover:bg-rose-600">
              <Link href="/browse">Browse Profiles</Link>
            </Button>

            <Button asChild variant="outline">
              <Link href="/profile">Complete Your Profile</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
