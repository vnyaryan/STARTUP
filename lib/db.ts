import { neon, type NeonQueryFunction } from "@neondatabase/serverless"

// Hardcoded connection string as requested
const CONNECTION_STRING =
  "postgresql://neondb_owner:npg_DXVMKp6Oxh3Q@ep-bold-water-a55uvkzl-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"

// Track connection status
let isConnected = false
let connectionError: Error | null = null
let lastConnectionAttempt = 0
const RECONNECT_INTERVAL = 60000 // 1 minute

// Create a SQL client with the connection string
let sql: NeonQueryFunction<any>

// Initialize the SQL client
function initSqlClient() {
  try {
    console.log("Initializing Neon SQL client...")

    // Use the hardcoded connection string
    sql = neon(CONNECTION_STRING)

    isConnected = true
    connectionError = null
    console.log("Neon SQL client initialized successfully")
    return sql
  } catch (error) {
    console.error("Failed to initialize Neon SQL client:", error)
    isConnected = false
    connectionError = error as Error
    throw error
  }
}

// Get the SQL client, reinitializing if necessary
export function getSql(): NeonQueryFunction<any> {
  const now = Date.now()

  // If we've never connected or if we had an error and it's been a while, try to reconnect
  if (!isConnected || (connectionError && now - lastConnectionAttempt > RECONNECT_INTERVAL)) {
    lastConnectionAttempt = now
    return initSqlClient()
  }

  return sql
}

// Helper function to create the users table if it doesn't exist
export async function initializeDatabase() {
  try {
    console.log("Initializing database...")
    const sql = getSql()

    // Check if the table exists first
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'user_details'
      ) as exists
    `

    console.log("Table exists check:", tableExists[0]?.exists)

    if (!tableExists[0]?.exists) {
      console.log("Creating user_details table...")
      await sql`
        CREATE TABLE user_details (
          email_id VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          date_of_birth DATE NOT NULL,
          username TEXT,
          age NUMERIC,
          sex TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `
      console.log("Table created successfully")
    } else {
      // Check if the new columns exist
      const columnsExist = await sql`
        SELECT 
          EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='user_details' AND column_name='username') as username_exists,
          EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='user_details' AND column_name='age') as age_exists,
          EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='user_details' AND column_name='sex') as sex_exists
      `

      // Add columns if they don't exist
      if (!columnsExist[0].username_exists) {
        await sql`ALTER TABLE user_details ADD COLUMN username TEXT`
        console.log("Added username column")
      }

      if (!columnsExist[0].age_exists) {
        await sql`ALTER TABLE user_details ADD COLUMN age NUMERIC`
        console.log("Added age column")
      }

      if (!columnsExist[0].sex_exists) {
        await sql`ALTER TABLE user_details ADD COLUMN sex TEXT`
        console.log("Added sex column")
      }

      console.log("Table already exists, checked/added new columns")
    }

    return { success: true }
  } catch (error) {
    console.error("Failed to initialize database:", error)
    return { success: false, error }
  }
}

// Helper function to check if a user exists
export async function checkUserExists(email: string): Promise<boolean> {
  try {
    console.log(`Checking if user exists: ${email}`)
    const sql = getSql()

    const result = await sql`
      SELECT COUNT(*) as count FROM user_details WHERE email_id = ${email}
    `

    const exists = result[0]?.count > 0
    console.log(`User exists check for ${email}: ${exists}`)
    return exists
  } catch (error) {
    console.error(`Error checking if user exists (${email}):`, error)
    // If there's an error checking, we'll assume the user doesn't exist
    // This prevents false positives
    return false
  }
}

// Initialize the SQL client on module load
initSqlClient()

export { sql }
