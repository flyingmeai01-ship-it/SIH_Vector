"use client";

import { useState, useEffect } from "react";

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
    gradient: "from-emerald-600 via-green-600 to-teal-700",
    shadowColor: "rgba(16, 185, 129, 0.35)",
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  {
    id: "voice",
    title: "Voice Talk",
    subtitle: "Speak, listen, and remember",
    emoji: "🎙️",
    gradient: "from-red-500 via-rose-600 to-red-700",
    shadowColor: "rgba(239, 68, 68, 0.35)",
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  {
    id: "help",
    title: "Get Help",
    subtitle: "Quick help & emergency alerts",
    emoji: "🆘",
    gradient: "from-yellow-500 via-amber-500 to-orange-500",
    shadowColor: "rgba(234, 179, 8, 0.35)",
    borderColor: "rgba(234, 179, 8, 0.3)",
  },
];

// ── Quick stats (placeholder) ───────────────
const QUICK_STATS = [
  { label: "Today's Score", value: "—", icon: "⭐" },
  { label: "Streak", value: "—", icon: "🔥" },
  { label: "Mood", value: "—", icon: "😊" },
];

// ── Action Card Component ───────────────────
function ActionCard({ action, index, onTap }) {
  const [pressed, setPressed] = useState(false);

  return (
    <button
      id={`action-${action.id}`}
      onClick={() => onTap(action.id)}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      className="w-full text-left focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-400/50 rounded-3xl"
      style={{
        animation: `fade-in-up 0.7s ease-out ${150 + index * 120}ms both`,
      }}
      aria-label={`${action.title}: ${action.subtitle}`}
    >
      <div
        className={`
          relative overflow-hidden rounded-3xl p-6 sm:p-8
          bg-gradient-to-br ${action.gradient}
          transition-all duration-300 ease-out
          ${pressed ? "scale-[0.97]" : "scale-100 hover:scale-[1.02]"}
        `}
        style={{
          boxShadow: pressed
            ? `0 4px 20px ${action.shadowColor}`
            : `0 8px 40px ${action.shadowColor}`,
          border: `1px solid ${action.borderColor}`,
        }}
      >
        {/* Glass overlay pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute -top-1/2 -right-1/2 w-full h-full rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)",
            }}
          />
        </div>

        <div className="relative flex items-center gap-5 sm:gap-6">
          {/* Emoji icon */}
          <div className="flex-shrink-0">
            <span
              className="text-5xl sm:text-6xl block"
              style={{
                filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))",
                animation: `float 4s ease-in-out ${index * 0.5}s infinite`,
              }}
              role="img"
              aria-hidden="true"
            >
              {action.emoji}
            </span>
          </div>

          {/* Text */}
          <div className="min-w-0">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {action.title}
            </h2>
            <p className="text-base sm:text-lg text-white/75 mt-1 font-light">
              {action.subtitle}
            </p>
          </div>

          {/* Arrow */}
          <div className="flex-shrink-0 ml-auto opacity-60">
            <svg
              className="w-8 h-8 sm:w-10 sm:h-10"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </div>
    </button>
  );
}

// ── Main Home Page ──────────────────────────
export default function Home() {
  const greeting = getGreeting();
  const { canInstall, install, isInstalled } = useInstallPrompt();
  const [currentTime, setCurrentTime] = useState("");
  const [activeAction, setActiveAction] = useState(null);

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

  // Handle action taps — placeholder for future routing
  const handleActionTap = (actionId) => {
    setActiveAction(actionId);
    // Future: navigate to game / voice / help pages
    setTimeout(() => setActiveAction(null), 800);
  };

  return (
    <main className="min-h-dvh flex flex-col relative overflow-hidden">
      {/* ── Ambient Background ─────────────────── */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        {/* Gradient orbs */}
        <div
          className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-20 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(124,58,237,0.6) 0%, transparent 70%)",
            animation: "float 8s ease-in-out infinite",
          }}
        />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full opacity-15 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(236,72,153,0.5) 0%, transparent 70%)",
            animation: "float 10s ease-in-out 2s infinite",
          }}
        />
        <div
          className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full opacity-10 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(245,158,11,0.5) 0%, transparent 70%)",
            animation: "float 12s ease-in-out 4s infinite",
          }}
        />
      </div>

      {/* ── Content Container ──────────────────── */}
      <div className="relative z-10 flex flex-col flex-1 w-full max-w-lg mx-auto px-5 sm:px-6 py-6 sm:py-8">

        {/* ── Top Bar: Time + Install ──────────── */}
        <header
          className="flex items-center justify-between mb-8 sm:mb-10"
          style={{ animation: "fade-in-up 0.5s ease-out both" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <span className="text-lg sm:text-xl">🧠</span>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-purple-300 tracking-wider uppercase">
                CARE
              </p>
              <p className="text-sm text-slate-400">{currentTime}</p>
            </div>
          </div>

          {/* Install button */}
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
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-xs">✅</span>
              <span className="text-xs font-medium text-emerald-400">Installed</span>
            </div>
          )}
        </header>

        {/* ── Greeting Section ─────────────────── */}
        <section
          className="mb-8 sm:mb-10"
          style={{ animation: "fade-in-up 0.6s ease-out 100ms both" }}
        >
          <p className="text-lg sm:text-xl text-slate-400 font-light">
            {greeting.emoji} {greeting.text}
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold mt-1 tracking-tight">
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #f1f5f9 0%, #c084fc 50%, #f472b6 100%)",
                backgroundSize: "200% 200%",
                animation: "gradient-shift 6s ease infinite",
              }}
            >
              Ready to play?
            </span>
          </h1>
        </section>

        {/* ── Quick Stats Row ──────────────────── */}
        <section
          className="grid grid-cols-3 gap-3 mb-8 sm:mb-10"
          style={{ animation: "fade-in-up 0.6s ease-out 200ms both" }}
          aria-label="Quick statistics"
        >
          {QUICK_STATS.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center gap-1 py-4 px-2 rounded-2xl
                         bg-white/[0.04] border border-white/[0.06]
                         backdrop-blur-sm"
            >
              <span className="text-2xl" role="img" aria-hidden="true">
                {stat.icon}
              </span>
              <span className="text-lg sm:text-xl font-bold text-white">
                {stat.value}
              </span>
              <span className="text-[11px] sm:text-xs text-slate-400 font-medium text-center leading-tight">
                {stat.label}
              </span>
            </div>
          ))}
        </section>

        {/* ── Main Action Cards ────────────────── */}
        <section className="flex flex-col gap-4 sm:gap-5 flex-1" aria-label="Main actions">
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
          style={{ animation: "fade-in-up 0.7s ease-out 700ms both" }}
        >
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
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
