import type * as React from "react"

interface EmailTemplateProps {
  username: string
  verificationUrl: string
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({ username, verificationUrl }) => (
  <div style={{ fontFamily: "Arial, sans-serif", lineHeight: "1.6" }}>
    <h1 style={{ color: "#f43f5e" }}>Welcome to Forever Match!</h1>
    <p>Hello {username},</p>
    <p>
      Thank you for signing up with Forever Match! To complete your registration and start finding your perfect match,
      please verify your email address by clicking the button below:
    </p>
    <div style={{ textAlign: "center", margin: "30px 0" }}>
      <a
        href={verificationUrl}
        style={{
          backgroundColor: "#f43f5e",
          color: "white",
          padding: "12px 24px",
          borderRadius: "4px",
          textDecoration: "none",
          fontWeight: "bold",
          display: "inline-block",
        }}
      >
        Verify Email Address
      </a>
    </div>
    <p>If you didn't create an account with us, you can safely ignore this email.</p>
    <p>This verification link will expire in 24 hours.</p>
    <p>If the button above doesn't work, you can also copy and paste the following link into your browser:</p>
    <p style={{ wordBreak: "break-all", color: "#4b5563" }}>{verificationUrl}</p>
    <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "10px" }}>
      Please verify your email on our official domain: v0-new-matrimony.vercel.app
    </p>
    <div
      style={{
        marginTop: "30px",
        borderTop: "1px solid #e5e7eb",
        paddingTop: "20px",
        color: "#6b7280",
        fontSize: "14px",
        textAlign: "center",
      }}
    >
      <p>&copy; {new Date().getFullYear()} Forever Match. All rights reserved.</p>
    </div>
  </div>
)
