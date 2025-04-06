import { queryOne } from "./db"

// Define TypeScript interfaces for better type safety
export interface NewUser {
  username: string
  email: string
  password_hash: string
  date_of_birth: Date
  gender: string
  location?: string
}

export interface User extends NewUser {
  id: string
  created_at: Date
  updated_at: Date
}

/**
 * Check if a user with the given email already exists
 * @param email - The email to check
 * @returns boolean indicating if the email exists
 */
export async function checkEmailExists(email: string): Promise<boolean> {
  const sql = "SELECT EXISTS(SELECT 1 FROM users WHERE email = $1) AS exists"
  const result = await queryOne<{ exists: boolean }>(sql, [email])
  return result?.exists || false
}

/**
 * Create a new user in the database
 * @param userData - The user data to insert
 * @returns The created user object
 */
export async function createUser(userData: NewUser): Promise<User> {
  const { username, email, password_hash, date_of_birth, gender, location } = userData

  const sql = `
    INSERT INTO users (username, email, password_hash, date_of_birth, gender, location)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, username, email, date_of_birth, gender, location, created_at, updated_at
  `

  const values = [username, email, password_hash, date_of_birth, gender, location || null]

  const result = await queryOne<User>(sql, values)
  if (!result) {
    throw new Error("Failed to create user")
  }
  return result
}

/**
 * Get a user by their ID
 * @param id - The user ID
 * @returns The user object or null if not found
 */
export async function getUserById(id: string): Promise<User | null> {
  const sql = `
    SELECT id, username, email, date_of_birth, gender, location, created_at, updated_at
    FROM users
    WHERE id = $1
  `

  return await queryOne<User>(sql, [id])
}

/**
 * Get a user by their email
 * @param email - The user email
 * @returns The user object or null if not found
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const sql = `
    SELECT id, username, email, date_of_birth, gender, location, created_at, updated_at
    FROM users
    WHERE email = $1
  `

  return await queryOne<User>(sql, [email])
}

/**
 * Get a user by their email, including password hash for authentication
 * @param email - The user email
 * @returns The user object with password_hash or null if not found
 */
export async function getUserWithPasswordByEmail(email: string): Promise<(User & { password_hash: string }) | null> {
  const sql = `
    SELECT id, username, email, password_hash, date_of_birth, gender, location, created_at, updated_at
    FROM users
    WHERE email = $1
  `

  return await queryOne<User & { password_hash: string }>(sql, [email])
}

