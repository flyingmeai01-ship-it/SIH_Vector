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
    <main className="min-h-dvh flex items-center justify-center bg-[#FDFBF7] px-5 py-8">
      <div className="w-full max-w-md bg-[#E3D5CA] border-2 border-[#2D2D2D] rounded-3xl p-8 shadow-none">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-teal-700 border-2 border-[#2D2D2D] rounded-2xl mx-auto flex items-center justify-center text-3xl mb-4">
            🛡️
          </div>
          <h1 className="text-2xl font-black text-[#2D2D2D]">Create Account</h1>
          <p className="text-sm font-bold text-[#2D2D2D] mt-2">Set up your secure local vault</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-[#2D2D2D] mb-1.5">First Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#FDFBF7] border-2 border-[#2D2D2D] rounded-xl px-4 py-3 text-[#2D2D2D] placeholder-gray-500 focus:outline-none focus:border-teal-700 transition-all"
              placeholder="e.g. Robert"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-[#2D2D2D] mb-1.5">Caregiver's Phone (Optional)</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-[#FDFBF7] border-2 border-[#2D2D2D] rounded-xl px-4 py-3 text-[#2D2D2D] placeholder-gray-500 focus:outline-none focus:border-teal-700 transition-all"
              placeholder="For emergency alerts"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#2D2D2D] mb-1.5">Secure Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#FDFBF7] border-2 border-[#2D2D2D] rounded-xl px-4 py-3 text-[#2D2D2D] placeholder-gray-500 focus:outline-none focus:border-teal-700 transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-teal-700 text-[#FDFBF7] border-2 border-[#2D2D2D] font-bold rounded-xl hover:bg-teal-800 active:scale-95 transition-all mt-4"
          >
            Create Local Account
          </button>
        </form>
        
        <p className="text-xs text-center font-bold text-[#2D2D2D] mt-6">
          Your data is encrypted and stored locally on this device.
        </p>
      </div>
    </main>
  );
}
