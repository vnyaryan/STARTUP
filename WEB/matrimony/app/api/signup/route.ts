import { query } from "@/lib/db"
import { sendVerificationEmail } from "@/lib/email"
import { hash } from "bcryptjs"
import { randomBytes } from "crypto"

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Validate the date before using it
    if (!data.dob) {
      return Response.json({ error: "Date of birth is required" }, { status: 400 })
    }

    // Try to parse the date and validate it
    const dobDate = new Date(data.dob)
    if (isNaN(dobDate.getTime())) {
      return Response.json({ error: "Invalid date format for date of birth" }, { status: 400 })
    }

    // Format the date as YYYY-MM-DD for PostgreSQL
    const formattedDob = dobDate.toISOString().split("T")[0]

    // Check if email already exists
    const existingUser = await query("SELECT * FROM users WHERE email = $1", [data.email])

    if (existingUser.rows.length > 0) {
      return Response.json({ error: "Email already registered" }, { status: 400 })
    }

    // Hash the password
    const hashedPassword = await hash(data.hashedPassword, 10)

    // Generate verification token
    const verificationToken = randomBytes(32).toString("hex")
    const tokenExpiry = new Date()
    tokenExpiry.setHours(tokenExpiry.getHours() + 24) // Token valid for 24 hours

    // Insert user into database
    const result = await query(
      `INSERT INTO users (email, password, gender, dob, name, email_verified, verification_token, token_expiry) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING id, email, name, gender, dob, email_verified`,
      [data.email, hashedPassword, data.gender, formattedDob, data.name, false, verificationToken, tokenExpiry],
    )

    const user = result.rows[0]

    // Send verification email
    try {
      await sendVerificationEmail(data.email, data.name, verificationToken)
      console.log("Verification email sent to:", data.email)
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError)
      // We still create the user, but log the email error
    }

    return Response.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.email_verified,
      },
      message: "Account created successfully. Please check your email to verify your account.",
    })
  } catch (error) {
    console.error("Signup error:", error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

