/**
 * Summary of Dashboard Component:
 *
 * - A simple and clean dashboard page built with React and Tailwind CSS.
 *
 * ✅ Purpose:
 * - Acts as the landing page for authenticated users after login.
 *
 * ✅ UI Layout:
 * - Displays a greeting header ("Dashboard") and welcome message.
 * - Provides two main navigation buttons:
 *   1. "View Profile" → navigates to `/profile`
 *   2. "Settings" → navigates to `/settings`
 *
 * ✅ Styling:
 * - Utilizes Tailwind CSS for layout and styling.
 * - Buttons include hover effects for better user experience.
 *
 * ✅ Use Case:
 * - Central hub for user actions in a logged-in state.
 * - Can be expanded later to include metrics, notifications, or quick links.
 */

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

