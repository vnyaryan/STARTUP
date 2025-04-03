import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendVerificationEmail(email: string, token: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const verificationUrl = `${appUrl}/verify-email?token=${token}`

  try {
    const { data, error } = await resend.emails.send({
      from: "onboarding@resend.dev", // Use Resend's default domain
      to: email,
      subject: "Verify your email address",
      html: `
        <h1>Email Verification</h1>
        <p>Thank you for signing up! Please verify your email address by clicking the link below:</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
      `,
    })

    if (error) {
      console.error("Error sending verification email", error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error sending verification email", error)
    return { success: false, error }
  }
}

export async function sendWelcomeEmail(email: string, username: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Welcome to Matrimony!",
      html: `
        <h1>Welcome to Matrimony, ${username}!</h1>
        <p>We're excited to have you join our community. Start exploring and find your perfect match!</p>
      `,
    })

    if (error) {
      console.error("Error sending welcome email", error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error sending welcome email", error)
    return { success: false, error }
  }
}

