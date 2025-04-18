import { Resend } from "resend"
import { EmailTemplate } from "@/components/email-template"

// Initialize Resend with the API key
const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Generate a verification token
 */
export function generateVerificationToken(): string {
  return Array.from({ length: 32 }, () => Math.floor(Math.random() * 36).toString(36)).join("")
}

/**
 * Send a verification email
 */
export async function sendVerificationEmail({
  to,
  username,
  verificationToken,
}: {
  to: string
  username: string
  verificationToken: string
}) {
  try {
    // Generate verification URL
    const baseUrl = "https://v0-new-matrimony.vercel.app"
    const verificationUrl = `${baseUrl}/api/auth/verify-email?token=${verificationToken}`

    const { data, error } = await resend.emails.send({
      from: "Forever Match <onboarding@resend.dev>",
      to: [to],
      subject: "Verify your Forever Match account",
      react: EmailTemplate({ username, verificationUrl }),
    })

    if (error) {
      console.error("Email sending error:", error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Email sending exception:", error)
    return { success: false, error }
  }
}
