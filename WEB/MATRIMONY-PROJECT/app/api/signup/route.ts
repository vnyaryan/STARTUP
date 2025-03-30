import { Resend } from "resend";
import { v4 as uuidv4 } from "uuid";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

const sql = neon(process.env.DATABASE_URL!);
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { name, email, password, age, location, interests, profilePicUrl } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    // ✅ Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Insert user into DB
    const result = await sql`
      INSERT INTO users (name, email, password, age, location, interests, profile_pic_url)
      VALUES (${name}, ${email}, ${hashedPassword}, ${age || null}, ${location || null}, ${interests || null}, ${profilePicUrl || null})
      RETURNING id;
    `;

    const userId = result[0].id;

    // ✅ Generate verification token
    const token = uuidv4();
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour expiry

    await sql`
      INSERT INTO email_verification_tokens (user_id, token, expires_at)
      VALUES (${userId}, ${token}, ${expires});
    `;

    // ✅ Send verification email
    const verifyLink = `https://startup-ruddy-eight.vercel.app/api/verify-email?token=${token}`;

    await resend.emails.send({
      from: "onboarding@resend.dev", // ✅ TEMPORARY TEST SENDER
      to: email,
      subject: "Verify Your Email",
      html: `
        <p>Hello ${name},</p>
        <p>Thank you for signing up! Please click the link below to verify your email:</p>
        <a href="${verifyLink}">${verifyLink}</a>
        <p>This link will expire in 1 hour.</p>
      `,
    });

    return NextResponse.json(
      { message: "Signup successful. Please check your email to verify your account." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Signup failed. Please try again." }, { status: 500 });
  }
}
