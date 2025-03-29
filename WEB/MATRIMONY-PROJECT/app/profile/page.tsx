"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function ProfilePage() {
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function fetchProfileImage() {
      const res = await fetch("/api/get-profile-image");
      const data = await res.json();
      if (data.profilePicUrl) setProfilePicUrl(data.profilePicUrl);
    }
    fetchProfileImage();
  }, []);

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const res = await fetch("/api/get-upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      });

      const { uploadUrl, blobUrl } = await res.json();

      await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      await fetch("/api/save-profile-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profilePicUrl: blobUrl }),
      });

      setProfilePicUrl(blobUrl);
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
    }
  }

  function handleLogout() {
    // Simple logout logic — redirect to login page
    window.location.href = "/login";
  }

  return (
    <div className="text-white p-8 min-h-screen bg-black">
      <h1 className="text-4xl font-bold mb-6">Your Profile</h1>

      {profilePicUrl && (
        <Image
          src={profilePicUrl}
          alt="Profile"
          width={150}
          height={150}
          className="rounded-full border-4 border-white mb-4"
        />
      )}

      <label className="cursor-pointer bg-yellow-600 px-4 py-2 rounded-md hover:bg-yellow-700 text-white inline-block mb-6">
        Upload Profile Image
        <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
      </label>

      {uploading && <p className="text-sm text-gray-400 mt-2">Uploading...</p>}

      <div className="space-y-2">
        <p><strong>Name:</strong> VINAY KUMAR ARYA</p>
        <p><strong>Email:</strong> vny.aryan@gmail.com</p>
        <p><strong>Age:</strong> 32</p>
        <p><strong>Location:</strong></p>
        <p><strong>Interests:</strong></p>
      </div>

      <button
        onClick={handleLogout}
        className="mt-6 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md"
      >
        Logout
      </button>
    </div>
  );
}
