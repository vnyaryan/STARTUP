import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { query } from './db';

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const COOKIE_NAME = 'auth_token';

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Compare password with hash
export async function comparePasswords(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Create JWT token
export async function createToken(payload: any): Promise<string> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(new TextEncoder().encode(JWT_SECRET));
  
  return token;
}

// Verify JWT token
export async function verifyToken(token: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET)
    );
    return { success: true, payload };
  } catch (error) {
    return { success: false, error: 'Invalid token' };
  }
}

// Get auth cookie (for server components)
export function getAuthCookie(): string | undefined {
  return cookies().get(COOKIE_NAME)?.value;
}

// Get current user (for server components)
export async function getCurrentUser() {
  const token = getAuthCookie();
  
  if (!token) {
    return null;
  }
  
  const { success, payload } = await verifyToken(token);
  
  if (!success || !payload) {
    return null;
  }
  
  try {
    const result = await query(
      'SELECT id, username, email, email_verified FROM users WHERE id = $1',
      [payload.id]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error getting current user', error);
    return null;
  }
}