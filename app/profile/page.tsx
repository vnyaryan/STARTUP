import { getSessionUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { executeQuery } from "@/lib/db"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Mail, Calendar, Shield } from "lucide-react"
import VerificationStatus from "@/components/profile/verification-status"
import { getUserVerificationStatuses } from "@/app/actions/verification-setup"

// Add more detailed logging at the beginning of the function
export default async function ProfilePage() {
  console.log("ProfilePage: Starting to render profile page")

  // Get the current user session
  const session = await getSessionUser()
  console.log("ProfilePage: Session data:", JSON.stringify(session, null, 2))

  // If no session, redirect to login
  if (!session || !session.id) {
    console.log("ProfilePage: No valid session found, redirecting to login")
    redirect("/login?redirect=/profile")
  }

  try {
    // Fetch user data from database
    console.log(`ProfilePage: Fetching user data for ID: ${session.id}`)
    const result = await executeQuery(
      `SELECT 
        id, 
        username, 
        email, 
        gender, 
        date_of_birth,
        profile_image_url,
        email_verified,
        created_at,
        role
      FROM users 
      WHERE id = $1`,
      [session.id],
    )

    console.log(`ProfilePage: Query result row count: ${result.rowCount}`)

    if (result.rowCount === 0) {
      console.log("ProfilePage: User not found in database")
      redirect("/login")
    }

    const user = result.rows[0]
    console.log("ProfilePage: User data retrieved successfully")

    // Get verification statuses
    const verificationResult = await getUserVerificationStatuses(session.id)
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
    let formattedBirthDate = "Not available"
    let formattedJoinDate = "Not available"

    try {
      if (user.date_of_birth) {
        const date = new Date(user.date_of_birth)
        formattedBirthDate = date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      }
    } catch (error) {
      console.error("Error formatting birth date:", error)
    }

    try {
      if (user.created_at) {
        const date = new Date(user.created_at)
        formattedJoinDate = date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      }
    } catch (error) {
      console.error("Error formatting join date:", error)
    }

    // Get initials for avatar fallback
    const getInitials = (name: string) => {
      if (!name) return "U"
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    }

    return (
      <div className="container mx-auto py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">My Profile</h1>

          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="personal">Personal Information</TabsTrigger>
              <TabsTrigger value="verification">Verification Status</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>

            <TabsContent value="personal">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left column - Profile image */}
                <div className="md:col-span-1">
                  <Card>
                    <CardContent className="pt-6 flex flex-col items-center">
                      <Avatar className="h-32 w-32 mb-4">
                        <AvatarImage src={user.profile_image_url || ""} alt={user.username} />
                        <AvatarFallback className="bg-rose-100 text-rose-500 text-2xl">
                          {getInitials(user.username)}
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

                      {user.role === "admin" && (
                        <div className="mt-2 bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs flex items-center">
                          <Shield className="h-3 w-3 mr-1" />
                          Admin
                        </div>
                      )}

                      <div className="w-full border-t mt-6 pt-4">
                        <p className="text-sm text-gray-500 text-center">Member since {formattedJoinDate}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="mt-4">
                    <Button asChild className="w-full">
                      <Link href="/profile/edit">Edit Profile</Link>
                    </Button>
                  </div>
                </div>

                {/* Right column - Details */}
                <div className="md:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
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
                        <div className="text-xs">
                          {user.email_verified ? (
                            <span className="text-green-600">✓ Verified</span>
                          ) : (
                            <span className="text-red-600">Not verified</span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-2" />
                          Date of Birth
                        </div>
                        <p className="font-medium">
                          {formattedBirthDate} {age ? `(${age} years old)` : ""}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-500">
                          <User className="h-4 w-4 mr-2" />
                          Gender
                        </div>
                        <p className="font-medium capitalize">{user.gender || "Not specified"}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Account Information</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-500">Account created on {formattedJoinDate}</p>
                        <div className="mt-4">
                          <Button variant="outline" asChild>
                            <Link href="/debug">View Debug Information</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="verification">
              <div className="grid grid-cols-1 gap-6">
                <VerificationStatus userId={user.id} verifications={verifications} isEditable={user.role === "admin"} />
              </div>
            </TabsContent>

            <TabsContent value="preferences">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Preferences</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">Preference settings will be available soon.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error in profile page:", error)

    return (
      <div className="container mx-auto py-10 px-4">
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Profile</h1>
          <p className="text-gray-700 mb-4">
            We encountered an error while loading your profile data. This could be due to a database connection issue.
          </p>
          <div className="bg-red-50 border border-red-200 rounded p-4 mb-6 text-sm text-red-800">
            {error instanceof Error ? error.message : "Unknown error occurred"}
          </div>
          <div className="flex flex-col gap-4">
            <Button asChild>
              <Link href="/">Return to Home</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/debug">View Debug Information</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }
}
