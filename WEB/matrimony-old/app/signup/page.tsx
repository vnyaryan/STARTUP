import Link from "next/link"
import { SignupForm } from "./signup-form"

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-rose-100 flex flex-col">
      <header className="container mx-auto py-6 px-4">
        <Link href="/" className="text-2xl font-bold text-rose-600">
          Matrimony
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-2xl font-bold text-center mb-6">Create Your Account</h1>
            <SignupForm />
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link href="/login" className="text-rose-600 hover:underline">
                  Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 text-white py-4">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} Matrimony Website. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

