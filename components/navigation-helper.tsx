"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { User, Search } from "lucide-react"

export default function NavigationHelper() {
  const pathname = usePathname()

  // Don't show on public pages
  if (pathname === "/" || pathname === "/login" || pathname === "/signup") {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2">
      {pathname !== "/profile" && (
        <Button asChild size="sm" className="bg-rose-500 hover:bg-rose-600 flex gap-2">
          <Link href="/profile">
            <User className="h-4 w-4" />
            <span>My Profile</span>
          </Link>
        </Button>
      )}

      {pathname !== "/browse" && (
        <Button asChild size="sm" variant="outline" className="flex gap-2">
          <Link href="/browse">
            <Search className="h-4 w-4" />
            <span>Browse</span>
          </Link>
        </Button>
      )}
    </div>
  )
}
