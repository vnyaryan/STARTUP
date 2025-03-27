"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@mui/material";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return <p style={{ padding: "2rem", color: "white" }}>Loading...</p>;
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  return (
    <div style={{ padding: "2rem", color: "white" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem" }}>Your Profile</h1>

      <p><strong>Name:</strong> {session.user?.name || "N/A"}</p>
      <p><strong>Email:</strong> {session.user?.email || "N/A"}</p>
      <p><strong>Age:</strong> 32</p>
      <p><strong>Location:</strong> </p>
      <p><strong>Interests:</strong> </p>

      <Button
        variant="contained"
        color="error"
        onClick={() => signOut({ callbackUrl: "/" })}
        sx={{ marginTop: "2rem" }}
      >
        Logout
      </Button>
    </div>
  );
}
