// In app/api/signup/route.ts
export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Use the query function from your db.ts
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