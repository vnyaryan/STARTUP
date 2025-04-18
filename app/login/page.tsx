import LoginForm from "@/components/login/login-form"
import Image from "next/image"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Login | Forever Match",
  description: "Log in to your Forever Match account to find your perfect partner",
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
            <p className="text-gray-500">Log in to continue your journey to find your perfect match</p>
          </div>
          <LoginForm />
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden md:block md:w-1/2 bg-rose-50 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-rose-500/20 to-transparent" />
        <Image
          src="https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1769&q=80"
          alt="Couple enjoying time together"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-black/30">
          <div className="max-w-md text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Find Your Perfect Match</h2>
            <p className="text-lg">
              Join thousands of happy couples who found their soulmate on our trusted matrimony platform.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
