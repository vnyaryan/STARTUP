import { Resend } from "resend"

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY)

// Default "from" email address
const defaultFrom = "Matrimony <onboarding@resend.dev>"

export async function sendVerificationEmail(email: string, token: string) {
  // Create the verification URL - direct to the API endpoint
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/verify-email?token=${token}`

  try {
    console.log(`Sending verification email to ${email} with URL: ${verificationUrl}`)

    const { data, error } = await resend.emails.send({
      from: defaultFrom,
      to: email,
      subject: "Verify Your Email",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Verify your email address</h2>
          <p>Thank you for signing up! Please verify your email address by clicking the button below:</p>
          <a href="${verificationUrl}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin: 20px 0;">
            Verify Email
          </a>
          <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
          <p>${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't sign up for an account, you can safely ignore this email.</p>
        </div>
      `,
    })

    if (error) {
      console.error("Error sending verification email:", error)
      throw new Error(`Failed to send verification email: ${error.message}`)
    }

    console.log("Verification email sent successfully:", data)
    return { success: true }
  } catch (error) {
    console.error("Error in sendVerificationEmail:", error)
    throw error
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`

  try {
    const { data, error } = await resend.emails.send({
      from: defaultFrom,
      to: email,
      subject: "Reset your password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Reset your password</h2>
          <p>You requested to reset your password. Click the button below to set a new password:</p>
          <a href="${resetUrl}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin: 20px 0;">
            Reset Password
          </a>
          <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
          <p>${resetUrl}</p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request a password reset, you can safely ignore this email.</p>
        </div>
      `,
    })

    if (error) {
      console.error("Error sending password reset email:", error)
      throw new Error(`Failed to send password reset email: ${error.message}`)
    }

    return { success: true }
  } catch (error) {
    console.error("Error in sendPasswordResetEmail:", error)
    throw error
  }
}

