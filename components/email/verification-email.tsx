import type * as React from "react"

interface VerificationEmailProps {
  username: string
  verificationUrl: string
}

export const VerificationEmail: React.FC<Readonly<VerificationEmailProps>> = ({ username, verificationUrl }) => (
  <div
    style={{
      fontFamily: "Arial, sans-serif",
      lineHeight: "1.6",
      color: "#333",
      maxWidth: "600px",
      margin: "0 auto",
    }}
  >
    <div
      style={{
        padding: "20px",
        border: "1px solid #e1e1e1",
        borderRadius: "5px",
      }}
    >
      <div
        style={{
          textAlign: "center",
          paddingBottom: "20px",
          borderBottom: "1px solid #e1e1e1",
        }}
      >
        <h1>Verify Your Email Address</h1>
      </div>
      <div
        style={{
          padding: "20px 0",
        }}
      >
        <p>Hello {username},</p>
        <p>
          Thank you for signing up with Forever Match! To complete your registration and start finding your perfect
          match, please verify your email address by clicking the button below:
        </p>
        <p style={{ textAlign: "center" }}>
          <a
            href={verificationUrl}
            style={{
              display: "inline-block",
              backgroundColor: "#f43f5e",
              color: "white",
              textDecoration: "none",
              padding: "10px 20px",
              borderRadius: "5px",
              margin: "20px 0",
            }}
          >
            Verify Email Address
          </a>
        </p>
        <p>If you didn't create an account with us, you can safely ignore this email.</p>
        <p>This verification link will expire in 24 hours.</p>
        <p>If the button above doesn't work, you can also copy and paste the following link into your browser:</p>
        <p>{verificationUrl}</p>
      </div>
      <div
        style={{
          paddingTop: "20px",
          borderTop: "1px solid #e1e1e1",
          textAlign: "center",
          fontSize: "12px",
          color: "#666",
        }}
      >
        <p>&copy; {new Date().getFullYear()} Forever Match. All rights reserved.</p>
      </div>
    </div>
  </div>
)
