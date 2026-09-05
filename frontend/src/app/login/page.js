"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [profileName, setProfileName] = useState("");
  
  useEffect(() => {
    const storedProfile = localStorage.getItem("care_profile");
    if (!storedProfile) {
      // No account exists, go to register
      router.replace("/register");
      return;
    }

    const auth = localStorage.getItem("care_auth");
    if (auth === "true") {
      // Already logged in
      router.replace("/");
      return;
    }

    try {
      const parsed = JSON.parse(storedProfile);
      setProfileName(parsed.name || "there");
    } catch (e) {
      console.error(e);
    }
  }, [router]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!password) return;

    const storedProfile = localStorage.getItem("care_profile");
    if (storedProfile) {
      try {
        const parsed = JSON.parse(storedProfile);
        const encodedPassword = btoa(password);
        
        if (parsed.password === encodedPassword) {
          // Success
          localStorage.setItem("care_auth", "true");
          router.push("/");
        } else {
          setErrorMsg("Incorrect password. Please try again.");
        }
      } catch (e) {
        setErrorMsg("Error accessing secure vault.");
      }
    }
  };

  return (
    <main className="min-h-dvh flex items-center justify-center bg-[#F8F9FA] px-5 py-8">
      <div className="w-full max-w-md bg-[#FFFFFF] shadow-md rounded-3xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#2A9D8F] shadow-sm rounded-2xl mx-auto flex items-center justify-center text-3xl mb-4">
            🔒
          </div>
          <h1 className="text-2xl font-black text-[#2D3748]">Welcome Back</h1>
          <p className="text-sm font-bold text-[#2D3748] mt-2">
            Enter your password, {profileName}
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-200 border-2 border-red-600 text-red-800 p-3 rounded-xl mb-6 text-center text-sm font-bold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-[#2D3748] mb-1.5">Secure Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#F8F9FA] border border-[#2D3748]/20 shadow-inner rounded-xl px-4 py-3 text-[#2D3748] placeholder-gray-500 focus:outline-none focus:border-[#2A9D8F] transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-[#2A9D8F] text-[#FFFFFF] shadow-sm font-bold rounded-xl hover:shadow-md hover:bg-[#1f7c70] active:scale-95 transition-all mt-4"
          >
            Unlock App
          </button>
        </form>
      </div>
    </main>
  );
}
