
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"
import { db } from "@/lib/db"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: { profileImage: true },
  })

  return NextResponse.json({ profilePicUrl: user?.profileImage || null })
}
