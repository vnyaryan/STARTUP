// Simple database utility
import { Pool } from "pg"

// Create a new pool using the DATABASE_URL environment variable
export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
})

// Helper function to execute queries
export async function query(text: string, params: any[] = []) {
  try {
    return await db.query(text, params)
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

