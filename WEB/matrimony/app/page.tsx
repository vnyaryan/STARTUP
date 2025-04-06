import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome to Our Site</h1>
          <p className="mt-2 text-gray-600">Please choose an option below</p>
        </div>

        <div className="flex flex-col space-y-4">
          <Link href="/login" className="w-full">
            <Button className="w-full" variant="outline">
              Login
            </Button>
          </Link>

          <Link href="/signup" className="w-full">
            <Button className="w-full">Sign Up</Button>
          </Link>

          <Link href="/about" className="w-full">
            <Button className="w-full" variant="secondary">
              About Us
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

