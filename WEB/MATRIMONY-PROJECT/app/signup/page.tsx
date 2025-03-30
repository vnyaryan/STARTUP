"use client";
import { Container, TextField, Button, Typography, Box } from "@mui/material";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    age: "",
    interests: "",
  });

  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
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
      let profilePicUrl = "";

      if (file) {
        const uploadUrlRes = await fetch("/api/get-upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: file.name, contentType: file.type }),
        });

        if (!uploadUrlRes.ok) throw new Error("Failed to get upload URL");

        const { uploadUrl, blobUrl } = await uploadUrlRes.json();

        const uploadRes = await fetch(uploadUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });

        if (!uploadRes.ok) throw new Error("Failed to upload image");

        profilePicUrl = blobUrl;
      }

      const signupRes = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, profilePicUrl }),
      });

      const data = await signupRes.json();

      if (signupRes.status === 400 || signupRes.status === 409 || signupRes.status >= 500) {
        setError(data.error || "Signup failed.");
      } else if (signupRes.status === 201) {
        setMessage(data.message || "Account created successfully!");
        setFormData({ email: "", password: "", name: "", age: "", interests: "" });
        router.push("/login");
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
        <TextField label="Full Name" name="name" value={formData.name} onChange={handleChange} required />
        <TextField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required />
        <TextField label="Password" name="password" type="password" value={formData.password} onChange={handleChange} required />
        <TextField label="Age" name="age" value={formData.age} onChange={handleChange} />
        <TextField label="Bio" name="interests" multiline rows={4} value={formData.interests} onChange={handleChange} />

        <Button variant="contained" component="label">
          Upload Profile Picture
          <input type="file" accept="image/*" hidden onChange={handleFileChange} />
        </Button>

        {isSubmitting && <Typography className="text-sm text-gray-500">Processing...</Typography>}

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