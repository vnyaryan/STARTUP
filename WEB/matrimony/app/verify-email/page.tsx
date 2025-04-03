import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

async function verifyEmail(token: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify?token=${token}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    return await response.json()
  } catch (error) {
    console.error("Error verifying email:", error)
    return { success: false, error: "An error occurred during verification" }
  }
}

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: { token?: string }
}) {
  const token = searchParams.token

  if (!token) {
    redirect("/")
  }

  const result = await verifyEmail(token)
  const success = result.success
  const message = result.message || result.error || "An error occurred during verification"

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-rose-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Email Verification</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className={`text-xl mb-6 ${success ? "text-green-600" : "text-red-600"}`}>{message}</div>
          <Link href={success ? "/login" : "/signup"}>
            <Button className="w-full bg-rose-600 hover:bg-rose-700">
              {success ? "Go to Login" : "Back to Sign Up"}
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

