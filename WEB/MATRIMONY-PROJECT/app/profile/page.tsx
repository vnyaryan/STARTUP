"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function ProfilePage() {
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfileImage() {
      try {
        const response = await fetch("/api/get-profile-image");

        if (!response.ok) throw new Error("Failed to fetch profile image URL");

        const { profilePicUrl } = await response.json();
        setProfileImageUrl(profilePicUrl);
      } catch (err: any) {
        console.error("Error fetching profile image:", err);
        setError(err.message || "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchProfileImage();
  }, []);

  if (loading)
    return <div className="text-gray-600 font-medium">Loading profile image...</div>;

  if (error)
    return <div className="text-red-500 font-medium">Error: {error}</div>;

  return (
    <div>
      {profileImageUrl ? (
        <Image
          src={profileImageUrl}
          alt="Profile Image"
          width={300}
          height={300}
          className="rounded-md"
        />
      ) : (
        <div className="text-gray-500 font-medium">No profile image available.</div>
      )}
    </div>
  );
}