"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

const GAMES = [
  {
    id: "memory",
    title: "Memory Match",
    subtitle: "Find the matching pairs to train short-term memory.",
    emoji: "🃏",
    gradient: "from-indigo-600 to-purple-700",
    href: "/games/memory",
  },
  {
    id: "tealeaf",
    title: "Tea Leaf Plucker",
    subtitle: "Tap the fresh tea leaves, ignore the dry ones! Trains selective attention.",
    emoji: "🌿",
    gradient: "from-emerald-500 to-teal-700",
    href: "/games/tealeaf",
  },
  {
    id: "festival-faces",
    title: "Festival Faces",
    subtitle: "Identify emotions from warm local festival scenarios.",
    emoji: "🎭",
    gradient: "from-amber-500 to-orange-700",
    href: "/games/festival-faces",
  },
  {
    id: "mountain-painter",
    title: "Mountain Soundscape",
    subtitle: "A stress-free canvas where strokes draw nature and play soothing sounds.",
    emoji: "🏔️",
    gradient: "from-cyan-500 to-teal-700",
    href: "/games/mountain-painter",
  },
];

export default function GamesHub() {
  const router = useRouter();

  return (
    <main className="min-h-dvh flex flex-col relative overflow-hidden bg-elder-canvas">
      <div className="relative z-10 flex flex-col flex-1 w-full max-w-lg mx-auto px-5 sm:px-6 py-6 sm:py-8">
        {/* ── Header ───────────────────────────── */}
        <header className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push("/")}
            className="w-12 h-12 bg-white border border-elder-muted/20 shadow-sm rounded-2xl flex items-center justify-center text-elder-text hover:shadow-md transition-all"
            aria-label="Go Back"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-elder-text tracking-tight">Games Hub</h1>
            <p className="text-sm text-elder-teal font-bold">Train your mind</p>
          </div>
          
          <div className="w-12 h-12" />
        </header>

        {/* ── Game List ────────────────────────── */}
        <div className="space-y-4">
          {GAMES.map((game) => (
            <Link
              key={game.id}
              href={game.href}
              className={`block relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br ${game.gradient} transition-transform duration-300 active:scale-[0.98] border border-white/10 shadow-lg`}
            >
              <div className="flex items-center gap-5">
                <span className="text-5xl block" role="img" aria-hidden="true">
                  {game.emoji}
                </span>
                <div className="min-w-0">
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    {game.title}
                  </h2>
                  <p className="text-sm text-white/80 mt-1">
                    {game.subtitle}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
