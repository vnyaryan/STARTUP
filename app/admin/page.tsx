import { getSessionUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Users, Settings, Database, FileCheck } from "lucide-react"

export default async function AdminDashboardPage() {
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
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </CardTitle>
            <CardDescription>Manage users, profiles, and accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/admin/users">Manage Users</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5" />
              Verifications
            </CardTitle>
            <CardDescription>Manage user verification statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/admin/verifications">Manage Verifications</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Maintenance
            </CardTitle>
            <CardDescription>System maintenance and cleanup tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/admin/maintenance">Maintenance Tasks</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database
            </CardTitle>
            <CardDescription>Database management and statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/api/setup/database" target="_blank" rel="noopener noreferrer">
                Run Database Setup
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
