"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Container, Box, Typography, TextField, Button, Paper, Alert } from "@mui/material"

export default function ResetPassword() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    newPassword: "",
  })
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleReset = async () => {
    if (!formData.email || !formData.newPassword) {
      setMessage("Please fill in all fields")
      return
    }

    setIsLoading(true)
    setMessage("")

    try {
      const response = await fetch("/api/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Password reset failed")
      }

      setMessage("Password reset successful! You can now login with your new password.")
    } catch (error) {
      console.error("Password reset error:", error)
      setMessage(error instanceof Error ? error.message : "Password reset failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Container component="main" maxWidth="xs" sx={{ mt: 8, mb: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography component="h1" variant="h4" sx={{ mb: 3 }}>
            Reset Password
          </Typography>

          {message && (
            <Alert severity={message.includes("successful") ? "success" : "error"} sx={{ width: "100%", mb: 2 }}>
              {message}
            </Alert>
          )}

          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={formData.email}
            onChange={handleChange}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            name="newPassword"
            label="New Password"
            type="password"
            id="newPassword"
            autoComplete="new-password"
            value={formData.newPassword}
            onChange={handleChange}
          />

          <Button fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} onClick={handleReset} disabled={isLoading}>
            {isLoading ? "Resetting..." : "Reset Password"}
          </Button>
        </Box>
      </Paper>
    </Container>
  )
}

