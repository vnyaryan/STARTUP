import { getSessionUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { executeQuery } from "@/lib/db"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getUserVerificationStatuses } from "@/app/actions/verification-setup"
import { ArrowLeft, FileCheck } from "lucide-react"
import VerificationManager from "@/components/admin/verification-manager"

interface VerifyUserPageProps {
  params: {
    id: string
  }
}

export default async function VerifyUserPage({ params }: VerifyUserPageProps) {
  // Check if user is authenticated and is admin
  const session = await getSessionUser()

  if (!session) {
    redirect("/login")
  }

  const isAdmin = session.role === "admin" || session.id === 1

  if (!isAdmin) {
    redirect("/")
  }

  const userId = params.id

  // Fetch user details
  const userResult = await executeQuery(
    `
    SELECT 
      id, 
      username, 
      email, 
      profile_image_url
    FROM users 
    WHERE id = $1
  `,
    [userId],
  )

  if (userResult.rowCount === 0) {
    redirect("/admin/users")
  }

  const user = userResult.rows[0]

  // Get verification statuses
  const verificationResult = await getUserVerificationStatuses(userId)
  const verifications = verificationResult.success ? verificationResult.verifications : {}

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center gap-2 mb-6">
        <Button asChild variant="outline" size="sm" className="h-8 w-8 p-0 mr-2">
          <Link href={`/admin/users/${userId}`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Manage Verifications</h1>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-rose-500" />
            Verification Management for {user.username}
          </CardTitle>
          <CardDescription>Update verification statuses for this user's documents and information</CardDescription>
        </CardHeader>
        <CardContent>
          <VerificationManager userId={userId} initialVerifications={verifications} />
        </CardContent>
      </Card>
    </div>
  )
}
