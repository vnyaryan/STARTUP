"use server"

import { executeQuery } from "@/lib/db"

export async function setupImageTables() {
  try {
    // Check if profile_image_url column exists in users table
    const columnCheckResult = await executeQuery(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'profile_image_url'
    `)

    // Add profile_image_url column to users table if it doesn't exist
    if (columnCheckResult.rowCount === 0) {
      await executeQuery(`
        ALTER TABLE users 
        ADD COLUMN profile_image_url TEXT,
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      `)
    }

    // Check if role column exists in users table
    const roleColumnCheck = await executeQuery(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'role'
    `)

    // Add role column to users table if it doesn't exist
    if (roleColumnCheck.rowCount === 0) {
      await executeQuery(`
        ALTER TABLE users 
        ADD COLUMN role VARCHAR(20) DEFAULT 'user'
      `)
    }

    // Check if password column exists in users table
    const passwordColumnCheck = await executeQuery(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'password_hash'
    `)

    // Add password column to users table if it doesn't exist
    if (passwordColumnCheck.rowCount === 0) {
      await executeQuery(`
        ALTER TABLE users 
        ADD COLUMN password_hash TEXT NOT NULL DEFAULT '',
        ADD COLUMN reset_token TEXT,
        ADD COLUMN reset_token_expires TIMESTAMP WITH TIME ZONE
      `)
    }

    // Check if email verification columns exist in users table
    const verificationColumnCheck = await executeQuery(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'email_verified'
    `)

    // Add email verification columns to users table if they don't exist
    if (verificationColumnCheck.rowCount === 0) {
      await executeQuery(`
        ALTER TABLE users 
        ADD COLUMN email_verified BOOLEAN DEFAULT FALSE,
        ADD COLUMN verification_token TEXT,
        ADD COLUMN verification_token_expires TIMESTAMP WITH TIME ZONE
      `)
    }

    // Check if gallery images table exists
    const tableCheckResult = await executeQuery(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'user_gallery_images'
    `)

    // Create gallery images table if it doesn't exist
    if (tableCheckResult.rowCount === 0) {
      await executeQuery(`
        CREATE TABLE IF NOT EXISTS user_gallery_images (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          image_url TEXT NOT NULL,
          privacy_level VARCHAR(20) NOT NULL DEFAULT 'members',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `)

      // Create indexes for faster queries
      await executeQuery(`
        CREATE INDEX IF NOT EXISTS idx_gallery_images_user_id ON user_gallery_images(user_id)
      `)
    }

    return { success: true }
  } catch (error) {
    console.error("Database setup error:", error)
    return {
      success: false,
      error: "Failed to set up database tables for image storage.",
    }
  }
}
