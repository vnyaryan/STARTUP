import { Container, Grid, Typography, Card, CardContent, CardMedia, Button } from "@mui/material";
import Link from "next/link";

// ✅ Dummy matchmaking data (instead of API)
async function getMatches() {
  return [
    { id: 1, name: "Aisha Khan", age: 27, city: "Delhi", img: "https://randomuser.me/api/portraits/women/47.jpg" },
    { id: 2, name: "Rahul Verma", age: 29, city: "Mumbai", img: "https://randomuser.me/api/portraits/men/40.jpg" },
    { id: 3, name: "Sneha Roy", age: 25, city: "Bangalore", img: "https://randomuser.me/api/portraits/women/32.jpg" },
  ];
}

export default async function MatchesPage() {
  const matches = await getMatches(); // Fetch dummy match data

  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      <Typography variant="h3" fontWeight="bold" color="primary" align="center" gutterBottom>
        Your Best Matches 💑
      </Typography>
      <Typography variant="h6" color="text.secondary" align="center" sx={{ mb: 4 }}>
        AI-Powered Matchmaking based on your preferences.
      </Typography>

      <Grid container spacing={3}>
        {matches.map((match) => (
          <Grid item xs={12} sm={6} md={4} key={match.id}>
            <Card sx={{ bgcolor: "background.paper", borderRadius: 3, boxShadow: 3 }}>
              <CardMedia component="img" height="200" image={match.img} alt={match.name} />
              <CardContent>
                <Typography variant="h5" fontWeight="bold">{match.name}</Typography>
                <Typography>Age: {match.age}</Typography>
                <Typography>City: {match.city}</Typography>
                <Grid container spacing={1} sx={{ mt: 2 }}>
                  <Grid item xs={6}>
                    <Button variant="contained" color="success" fullWidth>Like ❤️</Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button variant="contained" color="error" fullWidth>Dislike ❌</Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container justifyContent="center" sx={{ mt: 4 }}>
        <Button variant="contained" color="primary" size="large" component={Link} href="/">
          Back to Home
        </Button>
      </Grid>
    </Container>
  );
}


