import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { DashboardHeader } from "./dashboard-header"

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={user} />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Welcome, {user.username}!</h1>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Your Dashboard</h2>
          <p className="text-gray-600 mb-4">
            This is your personal dashboard where you can manage your profile and preferences.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <div className="bg-rose-50 p-6 rounded-lg border border-rose-100">
              <h3 className="text-lg font-medium mb-2">Complete Your Profile</h3>
              <p className="text-gray-600 mb-4">
                Add more details to your profile to increase your chances of finding a match.
              </p>
              <button className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded">Edit Profile</button>
            </div>

            <div className="bg-rose-50 p-6 rounded-lg border border-rose-100">
              <h3 className="text-lg font-medium mb-2">Browse Matches</h3>
              <p className="text-gray-600 mb-4">
                Explore potential matches based on your preferences and compatibility.
              </p>
              <button className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded">View Matches</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

