import postgres from "postgres"

// Create a singleton SQL client
let sql: ReturnType<typeof postgres> | null = null

export function getClient() {
  if (!sql) {
    const connectionString = process.env.DATABASE_URL

    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is not set")
    }

    // Create a new postgres client
    sql = postgres(connectionString, {
      // Connection options
      max: 10, // Maximum number of connections
      idle_timeout: 30, // Idle connection timeout in seconds
      connect_timeout: 10, // Connection timeout in seconds
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
    })
  }

  return sql
}

// Helper function to execute a query
export async function executeQuery(text: string, params: any[] = []): Promise<any> {
  const sql = getClient()

  try {
    // The postgres package has a different API than pg
    // We need to use tagged template literals
    const result = await sql.unsafe(text, params)
    return { rows: result, rowCount: result.length }
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

// Function to close the client (useful for testing or graceful shutdown)
export async function closeClient(): Promise<void> {
  if (sql) {
    await sql.end()
    sql = null
  }
}
