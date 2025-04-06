import { Container, Typography, Box, Button, Grid, Paper } from "@mui/material"
import Navbar from "@/components/Navbar"
import Link from "next/link"
import { getCurrentUser } from "@/lib/auth"
import FavoriteIcon from "@mui/icons-material/Favorite"
import SearchIcon from "@mui/icons-material/Search"
import SecurityIcon from "@mui/icons-material/Security"

export default async function Home() {
  const user = await getCurrentUser()
  const isLoggedIn = !!user

  return (
    <main>
      <Navbar isLoggedIn={isLoggedIn} />

      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: "primary.main",
          color: "white",
          py: 8,
          textAlign: "center",
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom>
            Find Your Perfect Match
          </Typography>
          <Typography variant="h5" component="h2" gutterBottom>
            Join thousands of happy couples who found their soulmate with us
          </Typography>
          <Box sx={{ mt: 4 }}>
            {!isLoggedIn && (
              <Button
                component={Link}
                href="/signup"
                variant="contained"
                size="large"
                sx={{
                  bgcolor: "white",
                  color: "primary.main",
                  "&:hover": {
                    bgcolor: "grey.100",
                  },
                  px: 4,
                  py: 1.5,
                  fontSize: "1.1rem",
                }}
              >
                Get Started
              </Button>
            )}
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" align="center" gutterBottom>
          Why Choose Us
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 4, height: "100%", textAlign: "center" }}>
              <FavoriteIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h5" component="h3" gutterBottom>
                Perfect Matches
              </Typography>
              <Typography color="text.secondary">
                Our advanced matching algorithm helps you find the most compatible partners based on your preferences.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 4, height: "100%", textAlign: "center" }}>
              <SearchIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h5" component="h3" gutterBottom>
                Extensive Search
              </Typography>
              <Typography color="text.secondary">
                Search for potential matches using multiple criteria including location, age, interests, and more.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 4, height: "100%", textAlign: "center" }}>
              <SecurityIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h5" component="h3" gutterBottom>
                Safe & Secure
              </Typography>
              <Typography color="text.secondary">
                Your privacy and security are our top priorities. All profiles are verified and your data is protected.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Call to Action */}
      <Box sx={{ bgcolor: "grey.100", py: 8, textAlign: "center" }}>
        <Container maxWidth="md">
          <Typography variant="h3" component="h2" gutterBottom>
            Ready to Find Your Soulmate?
          </Typography>
          <Typography variant="body1" paragraph sx={{ mb: 4 }}>
            Join thousands of happy couples who found their perfect match with us.
          </Typography>
          {!isLoggedIn && (
            <Box>
              <Button component={Link} href="/signup" variant="contained" color="primary" size="large" sx={{ mr: 2 }}>
                Sign Up Now
              </Button>
              <Button component={Link} href="/login" variant="outlined" color="primary" size="large">
                Login
              </Button>
            </Box>
          )}
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: "grey.900", color: "white", py: 6 }}>
        <Container maxWidth="lg">
          <Typography variant="body2" align="center">
            © {new Date().getFullYear()} Matrimony Website. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </main>
  )
}

