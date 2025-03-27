"use client"
import { Container, Typography, Paper, List, ListItem, ListItemText, Button, Box, Divider } from "@mui/material"
import { useState } from "react"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import CancelIcon from "@mui/icons-material/Cancel"

interface VerificationItem {
  id: string
  title: string
  status: "yes" | "no" | null
}

export default function VerificationPage() {
  const [verificationItems, setVerificationItems] = useState<VerificationItem[]>([
    { id: "aadhar", title: "AADHAR CARD VERIFICATION", status: null },
    { id: "voter", title: "Voter ID Verification", status: null },
    { id: "driving", title: "Driving License Verification", status: null },
    { id: "passport", title: "Passport Verification", status: null },
    { id: "criminal", title: "Criminal Court Record Check", status: null },
    { id: "employment", title: "Employment Verification", status: null },
    { id: "education", title: "Education Verification", status: null },
    { id: "credit", title: "Credit Check", status: null },
  ])

  const updateStatus = (id: string, status: "yes" | "no") => {
    setVerificationItems(prevItems =>
      prevItems.map(item => (item.id === id ? { ...item, status } : item))
    )
  }

  return (
    <Container maxWidth="md" sx={{ mt: 5, mb: 5 }}>
      <Typography variant="h4" fontWeight="bold" color="primary" align="center" gutterBottom>
        Verification Checklist
      </Typography>

      <Paper elevation={3} sx={{ mt: 4 }}>
        <List>
          {verificationItems.map((item, index) => (
            <Box key={item.id}>
              {index > 0 && <Divider />}
              <ListItem
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  alignItems: { xs: "flex-start", sm: "center" },
                  py: 2,
                  px: 3,
                  backgroundColor:
                    item.status === "yes"
                      ? "rgba(76, 175, 80, 0.08)"
                      : item.status === "no"
                      ? "rgba(244, 67, 54, 0.08)"
                      : "inherit",
                }}
              >
                <ListItemText
                  primary={
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      sx={{
                        textAlign: { xs: "center", sm: "left" },
                        mb: { xs: 2, sm: 0 },
                      }}
                    >
                      {item.title}
                    </Typography>
                  }
                />
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    width: { xs: "100%", sm: "auto" },
                    justifyContent: { xs: "center", sm: "flex-end" },
                  }}
                >
                  <Button
                    variant={item.status === "yes" ? "contained" : "outlined"}
                    color="success"
                    startIcon={<CheckCircleIcon />}
                    onClick={() => updateStatus(item.id, "yes")}
                    sx={{ minWidth: 100 }}
                  >
                    Yes
                  </Button>
                  <Button
                    variant={item.status === "no" ? "contained" : "outlined"}
                    color="error"
                    startIcon={<CancelIcon />}
                    onClick={() => updateStatus(item.id, "no")}
                    sx={{ minWidth: 100 }}
                  >
                    No
                  </Button>
                </Box>
              </ListItem>
            </Box>
          ))}
        </List>
      </Paper>

      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Button variant="contained" color="primary" size="large">
          Submit Verification Results
        </Button>
      </Box>
    </Container>
  )
}
