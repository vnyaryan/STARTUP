/**
 * Generate a verification token
 */
export function generateVerificationToken(): string {
  return Array.from({ length: 32 }, () => Math.floor(Math.random() * 36).toString(36)).join("")
}

/**
 * Send a verification email
 */
export async function sendVerificationEmail(email: string, username: string, verificationToken: string) {
  try {
    const response = await fetch("/api/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        username,
        verificationToken,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Failed to send verification email")
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error sending verification email:", error)
    return { success: false, error }
  }
}
