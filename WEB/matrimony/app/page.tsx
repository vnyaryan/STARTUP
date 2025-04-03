import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getCurrentUser } from "@/lib/auth"

export default async function Home() {
  const user = await getCurrentUser()

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-rose-100">
      <header className="container mx-auto py-6 px-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-rose-600">Matrimony</h1>
        <div className="space-x-4">
          {user ? (
            <Link href="/dashboard">
              <Button variant="outline">Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link href="/signup">
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Find Your Perfect Match</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join our community and start your journey to find your life partner.
          </p>

          {!user && (
            <div className="flex justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" className="bg-rose-600 hover:bg-rose-700">
                  Create Account
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">
                  Login
                </Button>
              </Link>
            </div>
          )}
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Create Your Profile</h3>
            <p className="text-gray-600">
              Sign up and create your detailed profile to showcase yourself to potential matches.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Find Compatible Matches</h3>
            <p className="text-gray-600">
              Browse through profiles and find people who match your preferences and values.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Connect & Communicate</h3>
            <p className="text-gray-600">
              Start conversations with potential matches and take the first step towards your future.
            </p>
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} Matrimony Website. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

