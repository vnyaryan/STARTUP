import { Container, Typography, Card, CardContent, Divider } from "@mui/material";

export default function AboutPage() {
  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      <Card sx={{ bgcolor: "background.paper", borderRadius: 3, boxShadow: 3, p: 3 }}>
        <CardContent>
          <Typography variant="h3" fontWeight="bold" color="primary" gutterBottom align="center">
            About Matrimony Elite 💍
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" color="text.secondary" paragraph>
            Matrimony Elite is a **premium matchmaking platform** designed to connect like-minded individuals for a **lifelong journey of happiness**.
          </Typography>
          <Typography variant="body1" paragraph>
            Our platform uses **AI-powered matchmaking** to help you find your perfect match based on your preferences, interests, and lifestyle.
          </Typography>
          <Typography variant="body1" paragraph>
            With a **strong focus on privacy and security**, we ensure that every profile is **verified** and genuine. Your **journey to love** starts here!
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
}
