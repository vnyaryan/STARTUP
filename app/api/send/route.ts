import { EmailTemplate } from "@/components/email-template"
import { Resend } from "resend"
import { type NextRequest, NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    // Verify the user is authenticated (for security)
    const session = await getSessionUser()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { email, username, verificationToken } = body

    if (!email || !username || !verificationToken) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Generate verification URL
    const baseUrl = "https://v0-new-matrimony.vercel.app"
    const verificationUrl = `${baseUrl}/api/auth/verify-email?token=${verificationToken}`

    const { data, error } = await resend.emails.send({
      from: "Forever Match <onboarding@resend.dev>",
      to: [email],
      subject: "Verify your Forever Match account",
      react: EmailTemplate({ username, verificationUrl }),
    })

    if (error) {
      console.error("Email sending error:", error)
      return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Email sending exception:", error)
    return NextResponse.json({ error }, { status: 500 })
  }
}
