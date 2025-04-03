import type * as React from "react"

interface VerificationEmailTemplateProps {
  name: string
  verificationUrl: string
}

export const VerificationEmailTemplate: React.FC<VerificationEmailTemplateProps> = ({ name, verificationUrl }) => (
  <div style={{ fontFamily: "Arial, sans-serif", maxWidth: "600px", margin: "0 auto" }}>
    <h2>Verify your email address</h2>
    <p>Hello {name},</p>
    <p>Thank you for signing up! Please verify your email address by clicking the button below:</p>
    <div style={{ textAlign: "center", margin: "30px 0" }}>
      <a
        href={verificationUrl}
        style={{
          display: "inline-block",
          backgroundColor: "#3b82f6",
          color: "white",
          padding: "12px 24px",
          textDecoration: "none",
          borderRadius: "4px",
          fontWeight: "bold",
        }}
      >
        Verify Email
      </a>
    </div>
    <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
    <p style={{ wordBreak: "break-all", color: "#3b82f6" }}>{verificationUrl}</p>
    <p>This link will expire in 24 hours.</p>
    <p>If you didn't sign up for an account, you can safely ignore this email.</p>
    <div
      style={{
        marginTop: "40px",
        borderTop: "1px solid #e5e7eb",
        paddingTop: "20px",
        color: "#6b7280",
        fontSize: "14px",
      }}
    >
      <p>© 2024 Matrimony. All rights reserved.</p>
    </div>
  </div>
)