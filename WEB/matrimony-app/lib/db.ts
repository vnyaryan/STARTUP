import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import { checkEmailExists, createUser } from "@/lib/user-db";

// Helper function to validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Helper function to validate date of birth (must be at least 18 years old)
function isValidAge(dateOfBirth: string): boolean {
  const dob = new Date(dateOfBirth);
  const today = new Date();
  const age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    return age - 1 >= 18;
  }
  
  return age >= 18;
}

export async function POST(request: NextRequest) {
  try {
    console.log("Signup API route called");
    
    // Parse request body
    const body = await request.json();
    console.log("Request body:", JSON.stringify(body));
    
    const { username, email, password, date_of_birth, gender } = body;

    // Validate required fields
    if (!username || !