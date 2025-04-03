import { Resend } from "resend"
import { EmailTemplate } from "@/components/emails/email-template"
import { VerificationEmailTemplate } from "@/components/emails/verification-email-template"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendVerificationEmail(email: string, token: string, username: string = "there") {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`

  try {
    const { data, error } = await resend.emails.send({
      from: "Matrimony <onboarding@resend.dev>", // Using Resend's default domain
      to: email,
      subject: "Verify your email address",
      react: VerificationEmailTemplate({ name: username, verificationUrl }),
    })

    if (error) {
      console.error("Error sending verification email", error)
      throw new Error("Failed to send verification email")
    }

    return data
  } catch (error) {
    console.error("Error sending verification email", error)
    throw new Error("Failed to send verification email")
  }
}

export async function sendWelcomeEmail(email: string, firstName: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: "Matrimony <onboarding@resend.dev>",
      to: email,
      subject: "Welcome to Matrimony!",
      react: EmailTemplate({ firstName }),
    })

    if (error) {
      console.error("Error sending welcome email", error)
      throw new Error("Failed to send welcome email")
    }

    return data
  } catch (error) {
    console.error("Error sending welcome email", error)
    throw new Error("Failed to send welcome email")
  }
}