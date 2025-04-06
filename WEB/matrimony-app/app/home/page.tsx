import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          {/* Left Content */}
          <div className="flex-1 space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900">
              Find Your Perfect <span className="text-rose-600">Match</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-700 max-w-xl">
              Join our trusted matrimony platform to connect with compatible partners who share your values and
              aspirations.
            </p>

            {/* Navigation Buttons */}
            <div className="flex flex-wrap gap-4 pt-6">
              <Button asChild size="lg" className="bg-rose-600 hover:bg-rose-700 text-white px-8">
                <Link href="/login">Login</Link>
              </Button>

              <Button asChild size="lg" className="bg-rose-600 hover:bg-rose-700 text-white px-8">
                <Link href="/signup">Sign Up</Link>
              </Button>

              <Button asChild variant="outline" size="lg" className="border-rose-600 text-rose-600 hover:bg-rose-50">
                <Link href="/about">About Us</Link>
              </Button>

              <Button asChild variant="outline" size="lg" className="border-rose-600 text-rose-600 hover:bg-rose-50">
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>

          {/* Right Image */}
          <div className="flex-1 relative">
            <div className="relative h-80 w-80 md:h-96 md:w-96 mx-auto">
              <div className="absolute inset-0 bg-rose-200 rounded-full opacity-20 animate-pulse"></div>
              <Image
                src="/globe.svg"
                alt="Find your match worldwide"
                width={400}
                height={400}
                className="relative z-10"
                priority
              />
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="h-12 w-12 bg-rose-100 rounded-full flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-rose-600"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Perfect Matches</h3>
            <p className="text-gray-600">
              Our advanced matching algorithm helps you find compatible partners based on your preferences.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="h-12 w-12 bg-rose-100 rounded-full flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-rose-600"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Safe & Secure</h3>
            <p className="text-gray-600">
              Your privacy and security are our top priorities. All profiles are verified and data is encrypted.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="h-12 w-12 bg-rose-100 rounded-full flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-rose-600"
              >
                <path d="M17 18a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2" />
                <rect width="18" height="18" x="3" y="4" rx="2" />
                <circle cx="12" cy="10" r="2" />
                <line x1="8" x2="8" y1="2" y2="4" />
                <line x1="16" x2="16" y1="2" y2="4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Verified Profiles</h3>
            <p className="text-gray-600">
              All profiles undergo a thorough verification process to ensure authenticity and trust.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

