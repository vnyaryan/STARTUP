import { query } from "./db"
import type { User, UserSignupData, SafeUser } from "@/types/user"
import bcrypt from "bcrypt"

export async function createUserTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password TEXT NOT NULL,
      gender VARCHAR(20) NOT NULL,
      dob DATE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `)
  console.log("Users table created or already exists")
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await query<User>("SELECT * FROM users WHERE email = $1", [email])
  return result.rows[0] || null
}

export async function createUser(userData: UserSignupData): Promise<SafeUser> {
  const { email, password, gender, dob } = userData

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10)

  const result = await query<User>(
    `INSERT INTO users (email, password, gender, dob) 
     VALUES ($1, $2, $3, $4) 
     RETURNING id, email, gender, dob, created_at`,
    [email, hashedPassword, gender, dob],
  )

  return result.rows[0] as SafeUser
}

export async function verifyUser(email: string, password: string): Promise<SafeUser | null> {
  const user = await getUserByEmail(email)

  if (!user) {
    return null
  }

  const passwordMatch = await bcrypt.compare(password, user.password)

  if (!passwordMatch) {
    return null
  }

  // Return user without password
  const { password: _, ...safeUser } = user
  return safeUser as SafeUser
}

