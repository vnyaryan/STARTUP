import { Pool } from "pg";

// Create a new pool using the DATABASE_URL environment variable
// This will connect to your Neon PostgreSQL database
export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: true } : false,
});

// Helper function to execute queries
export async function query(text: string, params: any[] = []) {
  const start = Date.now();
  try {
    const result = await db.query(text, params);
    const duration = Date.now() - start;
    
    // Log query execution time in development
    if (process.env.NODE_ENV !== "production") {
      console.log("Executed query", { text, duration, rows: result.rowCount });
    }
    
    return result;
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
}

// Helper function to get a single row
export async function queryOne(text: string, params: any[] = []) {
  const result = await query(text, params);
  return result.rows[0];
}

// Helper function to get multiple rows
export async function queryMany(text: string, params: any[] = []) {
  const result = await query(text, params);
  return result.rows;
}

// Function to check database connection
export async function testConnection() {
  try {
    const result = await query("SELECT NOW()");
    return { connected: true, timestamp: result.rows[0].now };
  } catch (error) {
    console.error("Database connection test failed:", error);
    return { connected: false, error };
  }
}