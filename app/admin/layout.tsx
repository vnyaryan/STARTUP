import type React from "react"
import { getSessionUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Check if user is authenticated
  const session = await getSessionUser()

  if (!session) {
    redirect("/login")
  }

  // Check if user has role property and it's admin, otherwise allow if it's the first user (ID 1)
  const isAdmin = session.role === "admin" || session.id === 1

  if (!isAdmin) {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      <header className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
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
                className="text-rose-400"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
              <h1 className="text-xl font-bold">Forever Match Admin</h1>
            </div>
            <nav className="flex gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin">Dashboard</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/users">Users</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/maintenance">Maintenance</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">Back to Site</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">{children}</main>

      <footer className="bg-gray-900 text-white py-4 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p>© {new Date().getFullYear()} Forever Match Admin. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
