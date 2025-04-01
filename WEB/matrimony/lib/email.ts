import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendVerificationEmail(email: string, token: string) {
  const confirmLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`

  try {
    const data = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: [email],
      subject: "Verify your email",
      html: `<p>Please click the following link to verify your email:</p><p><a href="${confirmLink}">Verify Email</a></p>`,
    })

    console.log("Verification email sent:", data)
    return data
  } catch (error) {
    console.error("Failed to send verification email:", error)
    throw error
  }
}

