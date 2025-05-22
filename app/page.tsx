import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DbConnectivityCheck } from "@/components/db-connectivity-check"
import { getSession } from "@/lib/session"
import { LogIn, UserPlus, User } from "lucide-react"

export default function HomePage() {
  // Check if user is logged in
  const session = getSession()
  const isLoggedIn = session && session.isLoggedIn

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md mb-6">
        <DbConnectivityCheck />
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome to Our Platform</CardTitle>
          <CardDescription className="text-center">
            {isLoggedIn ? `You are logged in as ${session.email}` : "Please login or create a new account to continue"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4">
          {isLoggedIn ? (
            <Link href="/profile" className="w-full">
              <Button className="w-full" size="lg">
                <User className="mr-2 h-4 w-4" />
                View Profile
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login" className="w-full">
                <Button className="w-full" size="lg">
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Button>
              </Link>

              <Link href="/signup" className="w-full">
                <Button className="w-full" variant="outline" size="lg">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
