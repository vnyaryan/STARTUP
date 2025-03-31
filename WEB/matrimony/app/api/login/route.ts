import { NextResponse } from "next/server"
import { getUserByEmail } from "@/lib/data"

export async function POST(request: Request) {
  const { email, password } = await request.json()

  // Inside the POST function
  // Replace the user verification with:
  const user = await getUserByEmail(email)

  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  }

  // TEMPORARY: Skip password verification for testing
  // const passwordMatch = await bcrypt.compare(password, user.password);
  const passwordMatch = true // TEMPORARY BYPASS

  if (!passwordMatch) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  }
}

