"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getRecentTelemetry, initDB } from "../lib/db";

/* ──────────────────────────────────────────────
   NEUROBLOOM — Home Screen (Stage 1A + Stage 2)
   Elderly-friendly PWA shell with 3 main actions
   ────────────────────────────────────────────── */

// ── Time-based greeting ─────────────────────
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return { text: "Good Morning", emoji: "🌅" };
  if (hour < 17) return { text: "Good Afternoon", emoji: "☀️" };
  if (hour < 21) return { text: "Good Evening", emoji: "🌇" };
  return { text: "Good Night", emoji: "🌙" };
}

// ── Install prompt hook ─────────────────────
function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setIsInstalled(true));

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === "accepted") setIsInstalled(true);
    setDeferredPrompt(null);
  };

  return { canInstall: !!deferredPrompt && !isInstalled, install, isInstalled };
}

// ── Main action cards data ──────────────────
const MAIN_ACTIONS = [
  {
    id: "games",
    title: "Play Games",
    subtitle: "Train your mind with fun puzzles",
    emoji: "🎮",
    bgClass: "bg-teal-700",
    href: "/games",
  },
  {
    id: "voice",
    title: "Voice Talk",
    subtitle: "Speak, listen, and remember",
    emoji: "🎙️",
    bgClass: "bg-[#D96C5B]",
    href: "/voice",
  },
  {
    id: "help",
    title: "Get Help",
    subtitle: "Quick help & emergency alerts",
    emoji: "🆘",
    bgClass: "bg-red-600",
  },
];

// ── Quick stats (dynamic from IndexedDB) ──────
// Loaded inside the component now
// ── Action Card Component ───────────────────
import Link from 'next/link';

function ActionCard({ action, index, onTap }) {
  const innerContent = (
    <div
      className={`
        relative overflow-hidden rounded-3xl p-6 sm:p-8
        ${action.bgClass} border-2 border-[#2D2D2D]
        transition-all duration-300 ease-out
        scale-100 group-hover:scale-[1.02] group-active:scale-[0.97]
      `}
    >
      <div className="relative flex items-center gap-5 sm:gap-6">
        {/* Emoji icon */}
        <div className="flex-shrink-0">
          <span
            className="text-5xl sm:text-6xl block"
            role="img"
            aria-hidden="true"
          >
            {action.emoji}
          </span>
        </div>

        {/* Text */}
        <div className="min-w-0">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#FDFBF7] tracking-tight">
            {action.title}
          </h2>
          <p className="text-base sm:text-lg text-[#FDFBF7] mt-1 font-medium">
            {action.subtitle}
          </p>
        </div>

        {/* Arrow */}
        <div className="flex-shrink-0 ml-auto opacity-90 text-[#FDFBF7]">
          <svg
            className="w-8 h-8 sm:w-10 sm:h-10"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );

  const commonProps = {
    id: `action-${action.id}`,
    className: "group w-full text-left focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-700/50 rounded-3xl block",
    style: { animation: `fade-in-up 0.7s ease-out ${150 + index * 120}ms both` },
    "aria-label": `${action.title}: ${action.subtitle}`
  };

  if (action.href) {
    return (
      <Link href={action.href} {...commonProps}>
        {innerContent}
      </Link>
    );
  }

  return (
    <button onClick={() => onTap(action.id)} {...commonProps}>
      {innerContent}
    </button>
  );
}


// ── Main Home Page ──────────────────────────
export default function Home() {
  const router = useRouter();
  const [greeting, setGreeting] = useState({ text: "Welcome", emoji: "👋" });
  const [profileName, setProfileName] = useState("");
  
  useEffect(() => {
    const storedProfile = localStorage.getItem("care_profile");
    if (!storedProfile) {
      router.replace("/register");
      return;
    }
    const auth = localStorage.getItem("care_auth");
    if (auth !== "true") {
      router.replace("/login");
      return;
    }

    try {
      const parsed = JSON.parse(storedProfile);
      if (parsed.name) {
        setProfileName(parsed.name);
      }
    } catch (e) {}

    setGreeting(getGreeting());
  }, [router]);
  const { canInstall, install, isInstalled } = useInstallPrompt();
  const [currentTime, setCurrentTime] = useState("");
  const [activeAction, setActiveAction] = useState(null);
  
  // Stage 2A: Offline DB Stats State
  const [stats, setStats] = useState([
    { label: "Today's Score", value: "—", icon: "⭐" },
    { label: "Streak", value: "—", icon: "🔥" },
    { label: "Mood", value: "—", icon: "😊" },
  ]);

  // Load telemetry from IndexedDB
  useEffect(() => {
    async function loadStats() {
      try {
        await initDB();
        const recent = await getRecentTelemetry(1);
        
        if (recent.length > 0) {
          // If we have data, update the UI!
          setStats((prev) => [
            { ...prev[0], value: recent[0].score.toString() },
            { ...prev[1], value: "1 day" },
            { ...prev[2], value: "Good" }
          ]);
        }
      } catch (e) {
        console.error("Failed to load DB stats", e);
      }
    }
    loadStats();
  }, []);

  // Live clock
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      );
    };
    tick();
    const interval = setInterval(tick, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle action taps — navigate or show placeholder
  const handleActionTap = (actionId) => {
    setActiveAction(actionId);
    setTimeout(() => setActiveAction(null), 800);
  };

  const handleLogout = () => {
    localStorage.setItem("care_auth", "false");
    router.replace("/login");
  };

  return (
    <main className="min-h-dvh flex flex-col relative bg-[#FDFBF7] text-[#2D2D2D]">
      {/* ── Content Container ──────────────────── */}
      <div className="relative z-10 flex flex-col flex-1 w-full max-w-md md:max-w-3xl lg:max-w-5xl mx-auto px-5 sm:px-6 md:px-8 py-6 sm:py-8 md:py-12">

        {/* ── Top Bar: Time + Install ──────────── */}
        <header
          className="flex items-center justify-between mb-8 sm:mb-10"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-teal-700 flex items-center justify-center border-2 border-[#2D2D2D]">
              <span className="text-lg sm:text-xl">🧠</span>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-[#2D2D2D] tracking-wider uppercase">
                CARE
              </p>
              <p className="text-sm font-medium text-[#2D2D2D]">{currentTime}</p>
            </div>
          </div>

          {/* Controls: Install + Logout */}
          <div className="flex items-center gap-2">
            {canInstall && (
              <button
                id="install-button"
                onClick={install}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold
                           bg-gradient-to-r from-purple-600 to-pink-600
                           text-white shadow-lg shadow-purple-500/25
                           hover:shadow-purple-500/40 hover:scale-105
                           active:scale-95 transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 4v12m0 0l-4-4m4 4l4-4" />
                </svg>
                Install App
              </button>
            )}

            {isInstalled && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hidden sm:flex">
                <span className="text-xs">✅</span>
                <span className="text-xs font-medium text-emerald-400">Installed</span>
              </div>
            )}
            
            <button
              onClick={handleLogout}
              className="flex items-center justify-center w-10 h-10 sm:w-auto sm:px-3 sm:py-2.5 rounded-2xl text-sm font-semibold bg-[#E3D5CA] border-2 border-[#2D2D2D] text-[#2D2D2D] hover:bg-[#d5c3b5] active:scale-95 transition-all"
              aria-label="Log out"
              title="Lock App"
            >
              🔒 Logout
            </button>
          </div>
        </header>

        {/* ── Greeting Section ─────────────────── */}
        <section
          className="mb-8 sm:mb-10"
        >
          <p className="text-xl sm:text-2xl text-[#2D2D2D] font-medium">
            {greeting.emoji} {greeting.text}{profileName ? `, ${profileName}` : ""}
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold mt-1 tracking-tight text-[#2D2D2D]">
            Ready to play?
          </h1>
        </section>

        {/* ── Quick Stats Row ──────────────────── */}
        <section
          className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6"
          aria-label="Quick statistics"
        >
          {stats.map((stat, i) => (
            <div
              key={i}
              className="bg-[#E3D5CA] border-2 border-[#2D2D2D] rounded-2xl p-3 sm:p-4 md:p-6 flex flex-col items-center justify-center text-center"
            >
              <span className="text-2xl md:text-3xl mb-1">{stat.icon}</span>
              <span className="text-[10px] sm:text-xs md:text-sm text-[#2D2D2D] font-bold tracking-wide uppercase mb-0.5 md:mb-1">
                {stat.label}
              </span>
              <span className="text-base sm:text-lg font-black text-[#2D2D2D]">
                {stat.value}
              </span>
            </div>
          ))}
        </section>

        {/* ── Main Action Cards ────────────────── */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 flex-1" aria-label="Main actions">
          {MAIN_ACTIONS.map((action, i) => (
            <ActionCard
              key={action.id}
              action={action}
              index={i}
              onTap={handleActionTap}
            />
          ))}
        </section>

        {/* ── Bottom Safe Area / Status ─────────── */}
        <footer
          className="mt-8 sm:mt-10 pb-4 text-center"
        >
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#2D2D2D]">
            <div className="w-3 h-3 rounded-full bg-teal-700 border border-[#2D2D2D]" />
            <span>Offline Ready — All data stays on your device</span>
          </div>
        </footer>
      </div>

      {/* ── Action Feedback Overlay ─────────────── */}
      {activeAction && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          style={{ animation: "scale-in 0.25s ease-out both" }}
        >
          <div className="bg-[#1e2338] rounded-3xl p-8 shadow-2xl text-center max-w-xs mx-4 border border-white/10">
            <span className="text-6xl block mb-4">
              {MAIN_ACTIONS.find((a) => a.id === activeAction)?.emoji}
            </span>
            <p className="text-xl font-semibold text-white">
              {MAIN_ACTIONS.find((a) => a.id === activeAction)?.title}
            </p>
            <p className="text-sm text-slate-400 mt-2">Coming soon...</p>
            <div
              className="mt-4 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
              style={{
                animation: "shimmer 1s linear infinite",
                backgroundSize: "200% 100%",
              }}
            />
          </div>
        </div>
      )}
    </main>
  );
}
