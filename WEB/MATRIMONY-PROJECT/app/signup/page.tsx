"use client";
import { Container, TextField, Button, Typography, Box } from "@mui/material";
import { useState } from "react";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",         // Changed from fullName to name
    age: "",
    interests: ""     // Changed from bio to interests
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setIsSubmitting(true);

    if (!formData.name || !formData.email || !formData.password) {
      setError("Name, email, and password are required");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.status === 400 || res.status === 409 || res.status >= 500) {
        setError(data.error || "Signup failed.");
      } else if (res.status === 201) {
        setMessage(data.message);
        setFormData({ email: "", password: "", name: "", age: "", interests: "" });
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Create an Account
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          label="Full Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <TextField
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <TextField
          label="Age"
          name="age"
          value={formData.age}
          onChange={handleChange}
        />
        <TextField
          label="Bio"
          name="interests"
          multiline
          rows={4}
          value={formData.interests}
          onChange={handleChange}
        />
        <Button type="submit" variant="contained" color="warning" disabled={isSubmitting}>
          Register
        </Button>
      </Box>
      {message && (
        <Typography color="success.main" align="center" sx={{ mt: 2 }}>
          {message}
        </Typography>
      )}
      {error && (
        <Typography color="error" align="center" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
    </Container>
  );
}
