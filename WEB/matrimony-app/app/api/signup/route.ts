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
    
    const { username, email, password, date_of_birth, gender, location } = body;

    // Validate required fields
    if (!username || !email || !password || !date_of_birth || !gender) {
      console.log("Missing required fields");
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      console.log("Invalid email format:", email);
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password strength (at least 8 characters)
    if (password.length < 8) {
      console.log("Password too short");
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Validate age (must be at least 18)
    if (!isValidAge(date_of_birth)) {
      console.log("User is under 18");
      return NextResponse.json(
        { error: "You must be at least 18 years old to register" },
        { status: 400 }
      );
    }

    // Validate gender
    const validGenders = ["male", "female", "other"];
    if (!validGenders.includes(gender.toLowerCase())) {
      console.log("Invalid gender value:", gender);
      return NextResponse.json(
        { error: "Invalid gender value" },
        { status: 400 }
      );
    }

    console.log("Checking if email exists:", email);
    // Check if email already exists
    const emailExists = await checkEmailExists(email);
    console.log("Email exists:", emailExists);
    
    if (emailExists) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    // Hash password
    console.log("Hashing password");
    const saltRounds = 10;
    const password_hash = await bcryptjs.hash(password, saltRounds);

    // Create user in database
    console.log("Creating user in database");
    const newUser = await createUser({
      username,
      email,
      password_hash,
      date_of_birth: new Date(date_of_birth),
      gender,
      location,
    });
    
    console.log("User created successfully:", newUser.id);

    // Return success response (excluding password)
    return NextResponse.json(
      {
        message: "User registered successfully",
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          date_of_birth: newUser.date_of_birth,
          gender: newUser.gender,
          location: newUser.location,
          created_at: newUser.created_at,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    // Log the error (but don't expose details to client)
    console.error("Signup error:", error);
    
    return NextResponse.json(
      { error: "Failed to register user" },
      { status: 500 }
    );
  }
}