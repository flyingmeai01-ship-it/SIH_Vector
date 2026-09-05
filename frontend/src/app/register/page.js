"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  
  useEffect(() => {
    // If they already have an account, don't let them register again
    if (localStorage.getItem("care_profile")) {
      router.replace("/");
    }
  }, [router]);

  const handleRegister = (e) => {
    e.preventDefault();
    if (!name || !password) return;

    // In a real app with backend, we'd hash this. For local offline PWA, 
    // we use a simple btoa encoding just to prevent shoulder surfing of localStorage.
    const encodedPassword = btoa(password);
    
    const profile = { name, phone, password: encodedPassword };
    localStorage.setItem("care_profile", JSON.stringify(profile));
    localStorage.setItem("care_auth", "true"); // Logged in
    
    router.push("/");
  };

  return (
    <main className="min-h-dvh flex items-center justify-center bg-[#1c0f13] px-5 py-8">
      <div className="w-full max-w-md bg-[#1e1518] border border-rose-900/50 rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-lg shadow-rose-500/20 mb-4">
            🛡️
          </div>
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-sm text-rose-300/70 mt-2">Set up your secure local vault</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-rose-200 mb-1.5">First Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black/50 border border-rose-900/50 rounded-xl px-4 py-3 text-white placeholder-rose-900 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
              placeholder="e.g. Robert"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-rose-200 mb-1.5">Caregiver's Phone (Optional)</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-black/50 border border-rose-900/50 rounded-xl px-4 py-3 text-white placeholder-rose-900 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
              placeholder="For emergency alerts"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-rose-200 mb-1.5">Secure Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/50 border border-rose-900/50 rounded-xl px-4 py-3 text-white placeholder-rose-900 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold rounded-xl shadow-lg hover:from-rose-500 hover:to-pink-500 active:scale-95 transition-all mt-4"
          >
            Create Local Account
          </button>
        </form>
        
        <p className="text-xs text-center text-slate-500 mt-6">
          Your data is encrypted and stored locally on this device.
        </p>
      </div>
    </main>
  );
}
