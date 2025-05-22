import crypto from "crypto"

// Function to hash a password
export function hashPassword(password: string): string {
  // In a production app, you would use a proper password hashing library like bcrypt
  // This is a simple implementation for demonstration purposes
  const salt = crypto.randomBytes(16).toString("hex")
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex")
  return `${salt}:${hash}`
}

// Function to verify a password
export function verifyPassword(storedPassword: string, suppliedPassword: string): boolean {
  const [salt, hash] = storedPassword.split(":")
  const suppliedHash = crypto.pbkdf2Sync(suppliedPassword, salt, 1000, 64, "sha512").toString("hex")
  return hash === suppliedHash
}
