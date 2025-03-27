"use client";
import { Container, Typography, TextField, Button, Card, CardContent } from "@mui/material";
import { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Message sent successfully!");
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Card sx={{ bgcolor: "background.paper", borderRadius: 3, boxShadow: 3, p: 3 }}>
        <CardContent>
          <Typography variant="h3" fontWeight="bold" color="primary" gutterBottom align="center">
            Contact Us 📩
          </Typography>

          <Typography variant="body1" color="text.secondary" align="center" paragraph>
            Have questions? Feel free to **reach out to us** by filling the form below.
          </Typography>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <TextField label="Full Name" name="name" value={form.name} onChange={handleChange} required fullWidth />
            <TextField label="Email" name="email" type="email" value={form.email} onChange={handleChange} required fullWidth />
            <TextField label="Message" name="message" multiline rows={4} value={form.message} onChange={handleChange} required fullWidth />
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Send Message
            </Button>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
}
