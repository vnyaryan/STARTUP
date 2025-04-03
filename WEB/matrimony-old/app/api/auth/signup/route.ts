import { z } from "zod";
import { hashPassword } from "@/lib/auth";
import { query } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/email";
import crypto from "crypto";

// Validation schema
const SignupSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(50),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  dateOfBirth: z.string().refine((date) => {
    const dob = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    return age >= 18;
  }, "You must be at least 18 years old"),
});

export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = SignupSchema.safeParse(body);

    if (!validationResult.success) {
      return Response.json(
        {
          success: false,
          error: "Validation failed",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { username, email, password, dateOfBirth } = validationResult.data;

    // Check if user already exists
    const existingUser = await query("SELECT * FROM users WHERE username = $1 OR email = $2", [username, email]);

    if (existingUser.rows.length > 0) {
      return Response.json(
        {
          success: false,
          error: "Username or email already exists",
        },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Insert user into database
    const result = await query(
      `INSERT INTO users (username, email, password, date_of_birth, verification_token)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, username, email`,
      [username, email, hashedPassword, dateOfBirth, verificationToken],
    );

    const newUser = result.rows[0];

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    return Response.json(
      {
        success: true,
        message: "User registered successfully. Please check your email to verify your account.",
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return Response.json(
      {
        success: false,
        error: "An error occurred during registration",
        details: process.env.NODE_ENV === "development" ? (error as Error).message : undefined,
      },
      { status: 500 }
    );
  }
}