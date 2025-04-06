import { query, queryOne } from "./db";

// Define TypeScript interfaces for better type safety
export interface NewUser {
  username: string;
  email: string;
  password_hash: string;
  date_of_birth: Date;
  gender: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  date_of_birth: Date;
  gender: string;
  created_at: Date;
}

/**
 * Check if a user with the given email already exists
 * @param email - The email to check
 * @returns boolean indicating if the email exists
 */
export async function checkEmailExists(email: string): Promise<boolean> {
  const sql = "SELECT EXISTS(SELECT 1 FROM users WHERE email = $1) AS exists";
  const result = await queryOne<{ exists: boolean }>(sql, [email]);
  return result?.exists || false;
}

/**
 * Create a new user in the database
 * @param userData - The user data to insert
 * @returns The created user object
 */
export async function createUser(userData: NewUser): Promise<User> {
  const { username, email, password_hash, date_of_birth, gender } = userData;
  
  const sql = `
    INSERT INTO users (username, email, password_hash, date_of_birth, gender)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, username, email, password_hash, date_of_birth, gender, created_at
  `;
  
  const values = [username, email, password_hash, date_of_birth, gender];
  
  const result = await queryOne<User>(sql, values);
  if (!result) {
    throw new Error("Failed to create user");
  }
  return result;
}

/**
 * Get a user by their ID
 * @param id - The user ID
 * @returns The user object or null if not found
 */
export async function getUserById(id: string): Promise<User | null> {
  const sql = `
    SELECT id, username, email, password_hash, date_of_birth, gender, created_at
    FROM users
    WHERE id = $1
  `;
  
  return await queryOne<User>(sql, [id]);
}

/**
 * Get a user by their email
 * @param email - The user email
 * @returns The user object or null if not found
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const sql = `
    SELECT id, username, email, password_hash, date_of_birth, gender, created_at
    FROM users
    WHERE email = $1
  `;
  
  return await queryOne<User>(sql, [email]);
}

/**
 * Get a user by their email, including password hash for authentication
 * @param email - The user email
 * @returns The user object with password_hash or null if not found
 */
export async function getUserWithPasswordByEmail(email: string): Promise<User | null> {
  const sql = `
    SELECT id, username, email, password_hash, date_of_birth, gender, created_at
    FROM users
    WHERE email = $1
  `;
  
  return await queryOne<User>(sql, [email]);
}

/**
 * Update a user's profile
 * @param id - The user ID
 * @param userData - The user data to update
 * @returns The updated user object
 */
export async function updateUser(id: string, userData: Partial<NewUser>): Promise<User | null> {
  // Build the SET clause dynamically based on provided fields
  const updates: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;
  
  // Add each field that is provided to the updates array
  if (userData.username !== undefined) {
    updates.push(`username = $${paramIndex++}`);
    values.push(userData.username);
  }
  
  if (userData.email !== undefined) {
    updates.push(`email = $${paramIndex++}`);
    values.push(userData.email);
  }
  
  if (userData.password_hash !== undefined) {
    updates.push(`password_hash = $${paramIndex++}`);
    values.push(userData.password_hash);
  }
  
  if (userData.date_of_birth !== undefined) {
    updates.push(`date_of_birth = $${paramIndex++}`);
    values.push(userData.date_of_birth);
  }
  
  if (userData.gender !== undefined) {
    updates.push(`gender = $${paramIndex++}`);
    values.push(userData.gender);
  }
  
  // If no fields to update, return the current user
  if (updates.length === 0) {
    return getUserById(id);
  }
  
  // Add the user ID to the values array
  values.push(id);
  
  const sql = `
    UPDATE users
    SET ${updates.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING id, username, email, password_hash, date_of_birth, gender, created_at
  `;
  
  return await queryOne<User>(sql, values);
}

/**
 * Delete a user
 * @param id - The user ID
 * @returns boolean indicating if the user was deleted
 */
export async function deleteUser(id: string): Promise<boolean> {
  const sql = "DELETE FROM users WHERE id = $1 RETURNING id";
  const result = await queryOne<{ id: string }>(sql, [id]);
  return result !== null;
}

/**
 * Get all users
 * @returns Array of users
 */
export async function getAllUsers(): Promise<User[]> {
  const sql = `
    SELECT id, username, email, password_hash, date_of_birth, gender, created_at
    FROM users
    ORDER BY created_at DESC
  `;
  
  const result = await query<User>(sql);
  return result || [];
}

/**
 * Search users by criteria
 * @param criteria - Search criteria
 * @returns Array of matching users
 */
export async function searchUsers(criteria: {
  gender?: string;
  minAge?: number;
  maxAge?: number;
}): Promise<User[]> {
  let conditions: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;
  
  if (criteria.gender) {
    conditions.push(`gender = $${paramIndex++}`);
    values.push(criteria.gender);
  }
  
  if (criteria.minAge !== undefined) {
    const minBirthDate = new Date();
    minBirthDate.setFullYear(minBirthDate.getFullYear() - criteria.minAge);
    conditions.push(`date_of_birth <= $${paramIndex++}`);
    values.push(minBirthDate);
  }
  
  if (criteria.maxAge !== undefined) {
    const maxBirthDate = new Date();
    maxBirthDate.setFullYear(maxBirthDate.getFullYear() - criteria.maxAge);
    conditions.push(`date_of_birth >= $${paramIndex++}`);
    values.push(maxBirthDate);
  }
  
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  
  const sql = `
    SELECT id, username, email, password_hash, date_of_birth, gender, created_at
    FROM users
    ${whereClause}
    ORDER BY created_at DESC
  `;
  
  const result = await query<User>(sql, values);
  return result || [];
}