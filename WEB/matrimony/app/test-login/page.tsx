"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Container, Box, Typography, TextField, Button, Paper, Alert } from "@mui/material"

export default function TestLogin() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleTestLogin = async () => {
    if (!email) {
      setMessage("Please enter an email")
      return
    }

    setIsLoading(true)
    setMessage("")

    try {
      const response = await fetch("/api/test-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Login failed")
      }

      setMessage("Login successful! Redirecting...")

      // Redirect to dashboard
      setTimeout(() => {
        router.push("/dashboard")
        router.refresh()
      }, 1000)
    } catch (error) {
      console.error("Test login error:", error)
      setMessage(error instanceof Error ? error.message : "Login failed. Please try again.")
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
            Test Login
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            This is a special test page that bypasses password verification.
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Button fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} onClick={handleTestLogin} disabled={isLoading}>
            {isLoading ? "Loading..." : "Test Login"}
          </Button>
        </Box>
      </Paper>
    </Container>
  )
}

