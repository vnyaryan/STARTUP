"use client";
import { useState } from "react";

export default function ProfileForm() {
  const [profile, setProfile] = useState({
    name: "",
    age: "",
    gender: "",
    bio: "",
    interests: [],
    profilePicture: null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleInterestsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setProfile((prevState) => ({
      ...prevState,
      interests: checked
        ? [...prevState.interests, value]
        : prevState.interests.filter((interest) => interest !== value),
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setProfile({ ...profile, profilePicture: e.target.files[0] });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Profile Data:", profile);
    alert("Profile saved successfully!");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Full Name */}
      <div>
        <label className="block text-sm font-semibold text-gray-600">Full Name</label>
        <input
          type="text"
          name="name"
          value={profile.name}
          onChange={handleChange}
          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your name"
          required
        />
      </div>

      {/* Age */}
      <div>
        <label className="block text-sm font-semibold text-gray-600">Age</label>
        <input
          type="number"
          name="age"
          value={profile.age}
          onChange={handleChange}
          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your age"
          required
        />
      </div>

      {/* Gender */}
      <div>
        <label className="block text-sm font-semibold text-gray-600">Gender</label>
        <select
          name="gender"
          value={profile.gender}
          onChange={handleChange}
          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm font-semibold text-gray-600">Bio</label>
        <textarea
          name="bio"
          value={profile.bio}
          onChange={handleChange}
          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Write about yourself"
          rows={3}
        ></textarea>
      </div>

      {/* Interests */}
      <div>
        <label className="block text-sm font-semibold text-gray-600">Interests</label>
        <div className="grid grid-cols-2 gap-2">
          {["Reading", "Traveling", "Cooking", "Sports", "Music", "Gaming"].map((interest) => (
            <label key={interest} className="flex items-center space-x-2">
              <input
                type="checkbox"
                value={interest}
                checked={profile.interests.includes(interest)}
                onChange={handleInterestsChange}
                className="form-checkbox text-blue-500"
              />
              <span>{interest}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Profile Picture */}
      <div>
        <label className="block text-sm font-semibold text-gray-600">Profile Picture</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {profile.profilePicture && (
          <div className="mt-2">
            <img
              src={URL.createObjectURL(profile.profilePicture)}
              alt="Profile Preview"
              className="w-24 h-24 rounded-full object-cover border-2 border-blue-500"
            />
          </div>
        )}
      </div>

      {/* Save Button */}
      <button
        type="submit"
        className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-700"
      >
        Save Profile
      </button>
    </form>
  );
}
