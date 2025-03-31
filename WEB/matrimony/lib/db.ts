import { Pool, type QueryResult } from "pg"

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: true,
  },
})

// Helper for running queries
export async function query<T = any>(text: string, params: any[] = []): Promise<QueryResult<T>> {
  const start = Date.now()
  try {
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    console.log("Executed query", { text, duration, rows: res.rowCount })
    return res
  } catch (error) {
    console.error("Query error:", error)
    throw error
  }
}

// For single-use connections (less efficient but sometimes needed)
export async function getClient() {
  const client = await pool.connect()
  return client
}

