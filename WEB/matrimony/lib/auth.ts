"use server"

import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"
import { db } from "./db"
import { compare, hash } from "bcrypt"
import { sendVerificationEmail, sendWelcomeEmail } from "./email"
import { v4 as uuidv4 } from "uuid"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function register(email: string, password: string, username: string) {
  try {
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return { success: false, error: "User with this email already exists" }
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    // Generate verification token
    const verificationToken = uuidv4()

    // Create user
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        username,
        verificationToken,
        tokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    })

    // Send verification email
    await sendVerificationEmail(email, verificationToken)

    return { success: true, userId: user.id }
  } catch (error) {
    console.error("Registration error:", error)
    return { success: false, error: "Failed to register user" }
  }
}

export async function login(email: string, password: string) {
  try {
    // Find user
    const user = await db.user.findUnique({
      where: { email },
    })

    if (!user) {
      return { success: false, error: "Invalid email or password" }
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return { success: false, error: "Please verify your email before logging in" }
    }

    // Verify password
    const passwordMatch = await compare(password, user.password)
    if (!passwordMatch) {
      return { success: false, error: "Invalid email or password" }
    }

    // Create session
    const token = await new SignJWT({ userId: user.id, email: user.email })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(new TextEncoder().encode(JWT_SECRET))

    // Set cookie
    const cookieStore = cookies()
    if (cookieStore) {
      cookieStore.set({
        name: "auth-token",
        value: token,
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 week
      })
    }

    return { success: true, userId: user.id }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, error: "Failed to login" }
  }
}

export async function logout() {
  const cookieStore = cookies()
  if (cookieStore) {
    cookieStore.delete("auth-token")
  }
  return { success: true }
}

export async function verifyEmail(token: string) {
  try {
    // Find user with this token
    const user = await db.user.findFirst({
      where: {
        verificationToken: token,
        tokenExpiry: { gt: new Date() },
      },
    })

    if (!user) {
      return { success: false, error: "Invalid or expired verification token" }
    }

    // Update user
    await db.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        tokenExpiry: null,
      },
    })

    // Send welcome email
    await sendWelcomeEmail(user.email, user.username)

    return { success: true }
  } catch (error) {
    console.error("Email verification error:", error)
    return { success: false, error: "Failed to verify email" }
  }
}

export async function getSession() {
  try {
    const token = cookies().get("auth-token")?.value

    if (!token) {
      return null
    }

    const verified = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET))

    return verified.payload
  } catch (error) {
    return null
  }
}

export async function getUserProfile() {
  try {
    const session = await getSession()

    if (!session || !session.userId) {
      return null
    }

    const user = await db.user.findUnique({
      where: { id: session.userId as string },
      select: {
        id: true,
        email: true,
        username: true,
        profile: true,
        createdAt: true,
      },
    })

    return user
  } catch (error) {
    console.error("Get user profile error:", error)
    return null
  }
}

