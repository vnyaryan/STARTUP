"use client";

import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Header() {
  const { data: session } = useSession();

  return (
    <AppBar position="static" sx={{ background: "linear-gradient(to right, #FFD700, #8B0000)" }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold" }}>
          Matrimony Elite
        </Typography>

        <Button color="inherit" component={Link} href="/">Home</Button>
        <Button color="inherit" component={Link} href="/about">About Us</Button>
        <Button color="inherit" component={Link} href="/contact">Contact Us</Button>

        {session ? (
          <>
            <Button color="inherit" component={Link} href="/profile">Profile</Button>
            <Button color="inherit" component={Link} href="/matches">Matches</Button>
            <Button color="inherit" onClick={() => signOut({ callbackUrl: "/" })}>
              Logout
            </Button>
          </>
        ) : (
          <>
            <Button color="inherit" component={Link} href="/signup">Signup</Button>
            <Button color="inherit" component={Link} href="/login">Login</Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}
