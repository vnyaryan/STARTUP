import { Container, Typography, Box, Paper } from "@mui/material"
import Navbar from "@/components/Navbar"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function Dashboard() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <>
      <Navbar isLoggedIn={true} />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome to Your Dashboard
          </Typography>
          <Typography variant="body1" paragraph>
            You are logged in as {user.email}
          </Typography>
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
              Your Profile Information
            </Typography>
            <Typography>Email: {user.email}</Typography>
            <Typography>Gender: {user.gender}</Typography>
            <Typography>Account created: {new Date(user.created_at).toLocaleDateString()}</Typography>
          </Box>
        </Paper>
      </Container>
    </>
  )
}

