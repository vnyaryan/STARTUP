import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/authOptions"; 
import { redirect } from "next/navigation";
import { neon } from "@neondatabase/serverless";

// Neon DB connection
const sql = neon(process.env.DATABASE_URL!);

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // Fetch user profile from Neon using session email
  const result = await sql`
    SELECT name, email, age, location, interests
    FROM users
    WHERE email = ${session.user?.email}
    LIMIT 1;
  `;
  const profile = result[0];

  if (!profile?.email) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-semibold">Profile not found.</h1>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Your Profile</h1>
      <div className="space-y-2">
        <p><strong>Name:</strong> {profile.name}</p>
        <p><strong>Email:</strong> {profile.email}</p>
        <p><strong>Age:</strong> {profile.age}</p>
        <p><strong>Location:</strong> {profile.location}</p>
        <p><strong>Interests:</strong> {profile.interests}</p>
      </div>
    </div>
  );
}
