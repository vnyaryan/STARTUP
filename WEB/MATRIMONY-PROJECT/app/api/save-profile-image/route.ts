
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"
import { db } from "@/lib/db"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { profilePicUrl } = await req.json()

  await db.user.update({
    where: { email: session.user.email },
    data: { profileImage: profilePicUrl },
  })

  return NextResponse.json({ success: true })
}
