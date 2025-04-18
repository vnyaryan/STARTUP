import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/context/auth-context"
import NavigationHelper from "@/components/navigation-helper"
// Import polyfills
import "../lib/react-polyfill"
import "../lib/radix-patch"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Forever Match - Find Your Perfect Partner",
  description: "A matrimony platform to help you find your perfect life partner",
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <NavigationHelper />
        </AuthProvider>
      </body>
    </html>
  )
}
