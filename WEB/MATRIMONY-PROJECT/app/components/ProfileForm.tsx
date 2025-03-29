
"use client";
import { useState } from "react";
import Image from "next/image";

export default function ProfileForm() {
  const [profile, setProfile] = useState({
    name: "",
    age: "",
    gender: "",
    bio: "",
    interests: [],
    profilePicture: null,
    profilePictureUrl: "",
  });
  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleInterestsChange = (e) => {
    const { value, checked } = e.target;
    setProfile((prevState) => ({
      ...prevState,
      interests: checked
        ? [...prevState.interests, value]
        : prevState.interests.filter((interest) => interest !== value),
    }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
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

      setProfile((prev) => ({ ...prev, profilePicture: file, profilePictureUrl: blobUrl }));
    } catch (error) {
      console.error("Image upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitted profile:", profile);
    // Submit logic here (API call)
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="text" name="name" value={profile.name} onChange={handleChange} placeholder="Name" className="border p-2 w-full" />
      <input type="number" name="age" value={profile.age} onChange={handleChange} placeholder="Age" className="border p-2 w-full" />
      <select name="gender" value={profile.gender} onChange={handleChange} className="border p-2 w-full">
        <option value="">Select Gender</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
      </select>
      <textarea name="bio" value={profile.bio} onChange={handleChange} placeholder="Bio" className="border p-2 w-full" />

      <div>
        <label className="block mb-1 font-medium">Upload Profile Picture:</label>
        <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} />
        {uploading && <p className="text-sm text-gray-500">Uploading...</p>}
        {profile.profilePictureUrl && (
          <div className="mt-4">
            <Image src={profile.profilePictureUrl} alt="Profile" width={200} height={200} className="rounded-md" />
          </div>
        )}
      </div>

      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        Submit
      </button>
    </form>
  );
}
