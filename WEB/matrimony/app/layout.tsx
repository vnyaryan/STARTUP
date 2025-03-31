import type React from "react"
import type { Metadata } from "next"
import ThemeRegistry from "./theme-provider"
import "./globals.css"
import { createUserTable } from "@/lib/user-db"

// Create tables on app initialization
try {
  createUserTable()
} catch (error) {
  console.error("Error creating tables:", error)
}

export const metadata: Metadata = {
  title: "Matrimony Website",
  description: "Find your perfect match",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  )
}



import './globals.css'