import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`

  try {
    const { data, error } = await resend.emails.send({
      from: "Matrimony <noreply@yourdomain.com>",
      to: email,
      subject: "Verify your email address",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Email Verification</h1>
          <p>Thank you for signing up! Please click the link below to verify your email address:</p>
          <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 4px;">Verify Email</a>
          <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
          <p>${verificationUrl}</p>
          <p>If you did not sign up for this service, please ignore this email.</p>
        </div>
      `,
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

