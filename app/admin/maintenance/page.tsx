import { getSessionUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cleanupOrphanedBlobs } from "@/lib/blob-utils"

export default async function AdminMaintenancePage() {
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
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Admin Maintenance</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Blob Storage Cleanup</CardTitle>
            <CardDescription>Clean up orphaned blob files that are no longer associated with any user.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              This task will scan all blob files and delete any that are not associated with an existing user. This
              helps keep your storage clean and reduces costs.
            </p>
          </CardContent>
          <CardFooter>
            <form
              action={async () => {
                "use server"
                await cleanupOrphanedBlobs()
              }}
            >
              <Button type="submit">Run Cleanup</Button>
            </form>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Database Setup</CardTitle>
            <CardDescription>Ensure all required database tables and columns exist.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              This task will check and create any missing tables or columns in the database. It's useful after updates
              or if you're experiencing database-related errors.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <a href="/api/setup/database" target="_blank" rel="noopener noreferrer">
                Run Database Setup
              </a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
