import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Fetch user from Neon DB by email
    const result = await sql`
      SELECT id, password, is_verified FROM users WHERE email = ${email} LIMIT 1;
    `;
    const user = result[0];

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if email is verified
    if (!user.is_verified) {
      return NextResponse.json({ error: 'Email not verified. Please check your inbox.' }, { status: 403 });
    }

    // Compare hashed passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    return NextResponse.json({ message: 'Login successful' }, { status: 200 });

  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
