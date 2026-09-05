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
    <main className="min-h-dvh flex items-center justify-center bg-[#1c0f13] px-5 py-8">
      <div className="w-full max-w-md bg-[#1e1518] border border-emerald-900/50 rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-lg shadow-emerald-500/20 mb-4">
            🔒
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
          <p className="text-sm text-emerald-300/70 mt-2">
            Enter your password, {profileName}
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl mb-6 text-center text-sm font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-emerald-200 mb-1.5">Secure Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/50 border border-emerald-900/50 rounded-xl px-4 py-3 text-white placeholder-emerald-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl shadow-lg hover:from-emerald-500 hover:to-teal-500 active:scale-95 transition-all mt-4"
          >
            Unlock App
          </button>
        </form>
      </div>
    </main>
  );
}
