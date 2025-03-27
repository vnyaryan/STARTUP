"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl: "/profile",
    });

    if (res?.ok) {
      router.push("/profile");
    } else {
      alert("Login failed");
    }
  };

  return (
    <form onSubmit={handleLogin} className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl mb-4">Login</h1>
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="mb-2 p-2 border w-full" />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="mb-2 p-2 border w-full" />
      <button type="submit" className="bg-blue-500 text-white p-2 w-full">Login</button>
    </form>
  );
}
