import { Resend } from "resend"

// Initialize Resend with the API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`

  try {
    const { data, error } = await resend.emails.send({
      from: "Matrimony <onboarding@resend.dev>", // Use your verified domain or the default Resend domain
      to: [email], // Make sure this is an array
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

// Function to send batch emails if needed
export async function sendBatchEmails(emails: Array<{ to: string[]; subject: string; html: string }>) {
  try {
    const emailRequests = emails.map((email) => ({
      from: "Matrimony <onboarding@resend.dev>",
      to: email.to,
      subject: email.subject,
      html: email.html,
    }))

    const { data, error } = await resend.batch.send(emailRequests)

    if (error) {
      console.error("Error sending batch emails:", error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Failed to send batch emails:", error)
    return { success: false, error }
  }
}

