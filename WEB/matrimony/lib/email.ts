import { Resend } from "resend"

// Initialize Resend with the API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`

  try {
    const { data, error } = await resend.emails.send({
      from: "Matrimony <noreply@yourdomain.com>",
      to: email,
      subject: "Verify your email address",
      html: `
        <div>
          <h1>Email Verification</h1>
          <p>Thank you for signing up! Please verify your email address by clicking the link below:</p>
          <a href="${verificationUrl}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
          <p>If you didn't sign up for an account, you can safely ignore this email.</p>
          <p>This link will expire in 24 hours.</p>
        </div>
      `,
    })

    if (error) {
      console.error("Error sending verification email:", error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Failed to send verification email:", error)
    return { success: false, error }
  }
}

