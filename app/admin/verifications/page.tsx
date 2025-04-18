import { getSessionUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { executeQuery } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { seedVerificationStatuses } from "@/app/actions/seed-verifications"

export default async function AdminVerificationsPage() {
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

  // Get all users with their verification statuses
  const result = await executeQuery(`
    SELECT 
      u.id, 
      u.username, 
      u.email,
      u.profile_image_url,
      COUNT(v.id) as verification_count,
      SUM(CASE WHEN v.status = 'verified' THEN 1 ELSE 0 END) as verified_count,
      SUM(CASE WHEN v.status = 'pending' THEN 1 ELSE 0 END) as pending_count,
      SUM(CASE WHEN v.status = 'failed' THEN 1 ELSE 0 END) as failed_count
    FROM 
      users u
    LEFT JOIN 
      verification_status v ON u.id = v.user_id
    GROUP BY 
      u.id, u.username, u.email, u.profile_image_url
    ORDER BY 
      u.username
  `)

  const users = result.rows

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">User Verifications</h1>

      <div className="grid grid-cols-1 gap-6">
        {users.map((user) => (
          <Card key={user.id}>
            <CardHeader>
              <CardTitle>{user.username}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
                  <span>Verified: {user.verified_count || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-full bg-amber-500"></span>
                  <span>Pending: {user.pending_count || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-full bg-red-500"></span>
                  <span>Failed: {user.failed_count || 0}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button asChild>
                  <Link href={`/profile/${user.id}`}>View Profile</Link>
                </Button>

                <form
                  action={async () => {
                    "use server"
                    await seedVerificationStatuses(user.id)
                  }}
                >
                  <Button type="submit" variant="outline">
                    Generate Test Data
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        ))}

        {users.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500">No users found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
