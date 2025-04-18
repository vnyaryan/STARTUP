"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Heart, Menu, X } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/context/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, loading, logout } = useAuth()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="container mx-auto px-4 py-6 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Heart className="h-8 w-8 text-rose-500" />
        <h1 className="text-2xl font-bold text-gray-800">Forever Match</h1>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/">Home</Link>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/about">About Us</Link>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/contact">Contact Us</Link>
        </Button>

        {loading ? (
          <Button variant="ghost" size="sm" disabled>
            Loading...
          </Button>
        ) : user ? (
          <>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/browse">Browse</Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.profileImageUrl || ""} alt={user.username} />
                    <AvatarFallback className="bg-rose-100 text-rose-500">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline">{user.username}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">My Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
                {user.role === "admin" && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">Admin Dashboard</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <>
            <Button variant="outline" size="sm" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button variant="default" size="sm" className="bg-rose-500 hover:bg-rose-600" asChild>
              <Link href="/signup">Signup</Link>
            </Button>
          </>
        )}
      </div>

      {/* Mobile Navigation Button */}
      <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMenu}>
        {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 right-0 bg-white shadow-lg z-50 p-4 flex flex-col space-y-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">Home</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/about">About Us</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/contact">Contact Us</Link>
          </Button>

          {loading ? (
            <Button variant="ghost" size="sm" disabled>
              Loading...
            </Button>
          ) : user ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/browse">Browse</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/profile">My Profile</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/settings">Settings</Link>
              </Button>
              {user.role === "admin" && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/admin">Admin Dashboard</Link>
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => logout()}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" asChild className="w-full">
                <Link href="/login">Login</Link>
              </Button>
              <Button variant="default" size="sm" className="bg-rose-500 hover:bg-rose-600 w-full" asChild>
                <Link href="/signup">Signup</Link>
              </Button>
            </>
          )}
        </div>
      )}
    </header>
  )
}
