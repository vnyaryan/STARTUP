import { Resend } from "resend"
import { VerificationEmailTemplate } from "@/components/VerificationEmailTemplate"

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY)

// Default "from" email address
const defaultFrom = "Matrimony <onboarding@resend.dev>"

export async function sendVerificationEmail(email: string, name: string, token: string) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/verify-email?token=${token}`

  try {
    console.log(`Sending verification email to ${email} with URL: ${verificationUrl}`)

    const { data, error } = await resend.emails.send({
      from: defaultFrom,
      to: [email],
      subject: "Verify Your Email",
      react: VerificationEmailTemplate({ name, verificationUrl }),
    })

    if (error) {
      console.error("Error sending verification email:", error)
      throw new Error(`Failed to send verification email: ${error.message}`)
    }

    console.log("Verification email sent successfully:", data)
    return { success: true, data }
  } catch (error) {
    console.error("Error in sendVerificationEmail:", error)
    throw error
  }
}

