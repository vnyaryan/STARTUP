"use client"
import { Container, Grid, Typography, Button } from "@mui/material"
import Link from "next/link"

export default function HomePage() {
  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      <Typography variant="h3" fontWeight="bold" color="primary" align="center" gutterBottom>
        Welcome to Matrimony Elite 💍
      </Typography>
      <Typography variant="h6" color="text.secondary" align="center" sx={{ mb: 4 }}>
        Find Your Perfect Match with AI-Powered Matchmaking.
      </Typography>

      {/* Navigation Buttons */}
      <Grid container spacing={3} sx={{ justifyContent: "center", mb: 4 }}>
        <Grid item>
          <Button variant="contained" color="primary" size="large" component={Link} href="/about">
            About Us
          </Button>
        </Grid>
        <Grid item>
          <Button variant="contained" color="secondary" size="large" component={Link} href="/contact">
            Contact Us
          </Button>
        </Grid>
        <Grid item>
          <Button variant="contained" color="success" size="large" component={Link} href="/profile">
            View Profile
          </Button>
        </Grid>
        <Grid item>
          <Button variant="contained" color="warning" size="large" component={Link} href="/signup">
            Signup
          </Button>
        </Grid>
        <Grid item>
          <Button variant="contained" color="info" size="large" component={Link} href="/login">
            Login
          </Button>
        </Grid>   
        {/* New Verification Button */}
        <Grid item>
          <Button variant="contained" color="error" size="large" component={Link} href="/verification">
            Verification
          </Button>
        </Grid>
      </Grid>
    </Container>
  )
}
