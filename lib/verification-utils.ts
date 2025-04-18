/**
 * Validates that a verification URL is correctly formatted with the proper domain
 */
export function validateVerificationUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return (
      urlObj.hostname === "v0-new-matrimony.vercel.app" &&
      urlObj.pathname === "/api/auth/verify-email" &&
      urlObj.searchParams.has("token")
    )
  } catch (error) {
    return false
  }
}

/**
 * Creates a properly formatted verification URL
 */
export function createVerificationUrl(token: string): string {
  return `https://v0-new-matrimony.vercel.app/api/auth/verify-email?token=${token}`
}
