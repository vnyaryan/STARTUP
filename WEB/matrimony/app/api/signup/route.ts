// In app/api/signup/route.ts
import { query } from '@/lib/db'; // Add this import at the top

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Now the query function will be defined
    const result = await query(
      `INSERT INTO users (email, password, gender, dob, name, email_verified) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [
        data.email,
        data.hashedPassword,
        data.gender,
        new Date(data.dob),
        data.name,
        false
      ]
    );
    
    // The result will be in result.rows[0]
    return Response.json({ success: true, user: result.rows[0] });
  } catch (error) {
    console.error("Signup error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}