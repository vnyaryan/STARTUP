import Link from "next/link"

export default function Dashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p className="mb-4">Welcome to your dashboard!</p>
      <div className="flex space-x-4">
        <Link href="/profile" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          View Profile
        </Link>
        <Link href="/settings" className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
          Settings
        </Link>
      </div>
    </div>
  )
}

