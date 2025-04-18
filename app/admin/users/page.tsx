import { getSessionUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { executeQuery } from "@/lib/db"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle, XCircle, User, FileCheck, Search } from "lucide-react"

export default async function AdminUsersPage() {
  // Check if user is authenticated and is admin
  const session = await getSessionUser()

  if (!session) {
    redirect("/login?redirect=/admin/users")
  }

  // Check if user has role property and it's admin, otherwise allow if it's the first user (ID 1)
  const isAdmin = session.role === "admin" || session.id === 1

  if (!isAdmin) {
    redirect("/")
  }

  // Fetch all users with their details
  const result = await executeQuery(`
    SELECT 
      u.id, 
      u.username, 
      u.email,
      u.gender,
      u.date_of_birth,
      u.profile_image_url,
      u.email_verified,
      u.created_at,
      u.role,
      COUNT(v.id) as verification_count,
      SUM(CASE WHEN v.status = 'verified' THEN 1 ELSE 0 END) as verified_count
    FROM 
      users u
    LEFT JOIN 
      verification_status v ON u.id = v.user_id
    GROUP BY 
      u.id, u.username, u.email, u.gender, u.date_of_birth, u.profile_image_url, u.email_verified, u.created_at, u.role
    ORDER BY 
      u.created_at DESC
  `)

  const users = result.rows

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string) => {
    try {
      const birthDate = new Date(dateOfBirth)
      const today = new Date()
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }

      return age
    } catch (error) {
      return null
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch (error) {
      return "Invalid date"
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <Button asChild>
          <Link href="/admin">Back to Dashboard</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-rose-500" />
            All Users ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Verification</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.profile_image_url || ""} alt={user.username} />
                          <AvatarFallback className="bg-rose-100 text-rose-500">
                            {user.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.username}</div>
                          <div className="text-xs text-gray-500">ID: {user.id}</div>
                        </div>
                        {user.role === "admin" && <Badge className="ml-2 bg-purple-500">Admin</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{user.email}</span>
                        <div className="flex items-center mt-1">
                          {user.email_verified ? (
                            <Badge
                              variant="outline"
                              className="text-green-600 border-green-200 flex items-center gap-1"
                            >
                              <CheckCircle className="h-3 w-3" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-red-600 border-red-200 flex items-center gap-1">
                              <XCircle className="h-3 w-3" />
                              Not Verified
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{user.gender || "Not specified"}</TableCell>
                    <TableCell>
                      {user.date_of_birth ? `${calculateAge(user.date_of_birth)} years` : "Not specified"}
                    </TableCell>
                    <TableCell>{formatDate(user.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Badge
                          className={`${Number.parseInt(user.verified_count || "0") > 0 ? "bg-green-500" : "bg-gray-300"}`}
                        >
                          {user.verified_count || 0}/{user.verification_count || 0}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button asChild size="sm" variant="outline" className="h-8 w-8 p-0">
                          <Link href={`/admin/users/${user.id}`}>
                            <Search className="h-4 w-4" />
                            <span className="sr-only">View details</span>
                          </Link>
                        </Button>
                        <Button asChild size="sm" variant="outline" className="h-8 w-8 p-0">
                          <Link href={`/admin/users/${user.id}/verify`}>
                            <FileCheck className="h-4 w-4" />
                            <span className="sr-only">Manage verifications</span>
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
