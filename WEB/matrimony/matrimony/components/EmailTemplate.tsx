import type * as React from "react"

interface EmailTemplateProps {
  firstName: string
}

export const EmailTemplate: React.FC<EmailTemplateProps> = ({ firstName }) => (
  <div style={{ fontFamily: "Arial, sans-serif", maxWidth: "600px", margin: "0 auto" }}>
    <h2>Welcome, {firstName}!</h2>
    <p>Thank you for signing up. We're excited to have you on board.</p>
    <p>This is a test email to verify that our email system is working correctly.</p>
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

