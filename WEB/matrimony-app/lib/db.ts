import { neon, neonConfig } from "@neondatabase/serverless"

// Configure neon
neonConfig.fetchConnectionCache = true

// Create a SQL executor using the DATABASE_URL environment variable
const sql = neon(process.env.DATABASE_URL!)

// Helper function to execute queries
export async function query<T = any>(text: string, params: any[] = []): Promise<T[]> {
  try {
    const start = Date.now()
    const result = (await sql(text, params)) as T[]
    const duration = Date.now() - start

    // Log query execution time in development
    if (process.env.NODE_ENV !== "production") {
      console.log("Executed query", { text, duration, rows: result.length })
    }

    return result
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

// Helper function to get a single row
export async function queryOne<T = any>(text: string, params: any[] = []): Promise<T | null> {
  const results = await query<T>(text, params)
  return results.length > 0 ? results[0] : null
}

// Helper function to get multiple rows
export async function queryMany<T = any>(text: string, params: any[] = []): Promise<T[]> {
  return await query<T>(text, params)
}

// Function to check database connection
export async function testConnection() {
  try {
    const result = await query("SELECT NOW()")
    return { connected: true, timestamp: result[0].now }
  } catch (error) {
    console.error("Database connection test failed:", error)
    return { connected: false, error }
  }
}

