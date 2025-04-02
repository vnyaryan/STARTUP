// In app/api/signup/route.ts
import { query } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validate the date before using it
    if (!data.dob) {
      return Response.json({ error: "Date of birth is required" }, { status: 400 });
    }
    
    // Try to parse the date and validate it
    const dobDate = new Date(data.dob);
    if (isNaN(dobDate.getTime())) {
      return Response.json({ error: "Invalid date format for date of birth" }, { status: 400 });
    }
    
    // Format the date as YYYY-MM-DD for PostgreSQL
    const formattedDob = dobDate.toISOString().split('T')[0];
    
    console.log("Formatted DOB:", formattedDob); // For debugging
    
    const result = await query(
      `INSERT INTO users (email, password, gender, dob, name, email_verified) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [
        data.email,
        data.hashedPassword,
        data.gender,
        formattedDob, // Use the formatted date string
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