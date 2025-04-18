import { getSessionUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { executeQuery } from "@/lib/db"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getUserVerificationStatuses } from "@/app/actions/verification-setup"
import VerificationStatus from "@/components/profile/verification-status"
import { ArrowLeft, User, Mail, Calendar } from "lucide-react"

interface UserDetailPageProps {
  params: {
    id: string
  }
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
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
      gender, 
      date_of_birth, 
      profile_image_url, 
      email_verified, 
      created_at, 
      updated_at,
      role
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

  // Calculate age from date of birth
  let age = null
  try {
    if (user.date_of_birth) {
      const birthDate = new Date(user.date_of_birth)
      const today = new Date()
      age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
    }
  } catch (error) {
    console.error("Error calculating age:", error)
  }

  // Format dates
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch (error) {
      return "Invalid date"
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center gap-2 mb-6">
        <Button asChild variant="outline" size="sm" className="h-8 w-8 p-0 mr-2">
          <Link href="/admin/users">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">User Details</h1>
        {user.role === "admin" && <Badge className="ml-2 bg-purple-500">Admin</Badge>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column - User profile */}
        <div className="md:col-span-1">
          <Card>
            <CardContent className="pt-6 flex flex-col items-center">
              <Avatar className="h-32 w-32 mb-4">
                <AvatarImage src={user.profile_image_url || ""} alt={user.username} />
                <AvatarFallback className="bg-rose-100 text-rose-500 text-2xl">
                  {user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <h2 className="text-xl font-semibold text-center">{user.username}</h2>

              <div className="flex items-center gap-2 mt-1 text-gray-500">
                <span className="capitalize">{user.gender || "Not specified"}</span>
                {age && (
                  <>
                    <span>•</span>
                    <span>{age} years</span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2 mt-4">
                {user.email_verified ? (
                  <Badge className="bg-green-500 hover:bg-green-600">Email Verified</Badge>
                ) : (
                  <Badge variant="outline" className="text-red-500 border-red-200">
                    Email Not Verified
                  </Badge>
                )}
              </div>

              <div className="w-full border-t mt-6 pt-4">
                <p className="text-sm text-gray-500 text-center">Member since {formatDate(user.created_at)}</p>
              </div>
            </CardContent>
          </Card>

          <div className="mt-4 flex gap-2">
            <Button asChild className="w-full">
              <Link href={`/admin/users/${userId}/verify`}>Manage Verifications</Link>
            </Button>
          </div>
        </div>

        {/* Right column - User details */}
        <div className="md:col-span-2">
          <Tabs defaultValue="details">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">User Details</TabsTrigger>
              <TabsTrigger value="verification">Verification Status</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>User's personal details and account information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-500">
                      <User className="h-4 w-4 mr-2" />
                      Username
                    </div>
                    <p className="font-medium">{user.username}</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-500">
                      <Mail className="h-4 w-4 mr-2" />
                      Email Address
                    </div>
                    <p className="font-medium">{user.email}</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-2" />
                      Date of Birth
                    </div>
                    <p className="font-medium">
                      {user.date_of_birth ? formatDate(user.date_of_birth) : "Not specified"}
                      {age ? ` (${age} years old)` : ""}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-500">
                      <User className="h-4 w-4 mr-2" />
                      Gender
                    </div>
                    <p className="font-medium capitalize">{user.gender || "Not specified"}</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-2" />
                      Account Created
                    </div>
                    <p className="font-medium">{formatDate(user.created_at)}</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-2" />
                      Last Updated
                    </div>
                    <p className="font-medium">{formatDate(user.updated_at)}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="verification" className="mt-4">
              <VerificationStatus userId={userId} verifications={verifications} isEditable={true} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
