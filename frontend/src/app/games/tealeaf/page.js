"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { saveTelemetry } from "../../../lib/db";

const ITEM_TYPES = {
  target: { emoji: "🌱", points: 100 },
  dry: { emoji: "🍂", points: -50 },
  weed: { emoji: "☘️", points: -50 }
};

const ENCOURAGEMENTS = ["Great work!", "Marvelous!", "Nice work!", "You got it!"];

export default function TeaLeafPlucker() {
  const router = useRouter();

  const [items, setItems] = useState([]);
  const [floatingTexts, setFloatingTexts] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameState, setGameState] = useState("playing"); // 'playing', 'won'
  
  const timerRef = useRef(null);
  const spawnerRef = useRef(null);
  const gameActive = useRef(true);
  const scoreRef = useRef(0);
  const correctTapsRef = useRef(0);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  const stopGame = useCallback(() => {
    gameActive.current = false;
    clearInterval(timerRef.current);
    clearTimeout(spawnerRef.current);
  }, []);

  // Initialize Game
  useEffect(() => {
    startGame();
    return stopGame;
  }, [stopGame]);

  const startGame = () => {
    gameActive.current = true;
    setItems([]);
    setFloatingTexts([]);
    setScore(0);
    setTimeLeft(60);
    setGameState("playing");

    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleGameEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    clearTimeout(spawnerRef.current);
    spawnItem();
  };

  const spawnItem = useCallback(() => {
    if (!gameActive.current) return;

    const currentScore = scoreRef.current;
    const level = currentScore >= 1000 ? 3 : (currentScore >= 500 ? 2 : 1);
    
    let fallMin, fallMax, spawnRate;
    if (level === 1) { fallMin = 8; fallMax = 10; spawnRate = 1500; }
    else if (level === 2) { fallMin = 6; fallMax = 8; spawnRate = 1200; }
    else { fallMin = 4; fallMax = 6; spawnRate = 800; }

    // 50% chance for target, 50% for distractors
    const isTarget = Math.random() > 0.5;
    const typeKey = isTarget ? "target" : (Math.random() > 0.5 ? "dry" : "weed");
    const itemData = ITEM_TYPES[typeKey];

    const newItem = {
      id: Math.random().toString(36).substring(2, 11),
      type: typeKey,
      emoji: itemData.emoji,
      points: itemData.points,
      x: Math.floor(Math.random() * 70) + 10, // left: 10% to 80%
      duration: Math.random() * (fallMax - fallMin) + fallMin, 
      tapped: false
    };

    setItems((prev) => [...prev, newItem]);
    
    spawnerRef.current = setTimeout(spawnItem, spawnRate);
  }, []);

  const handleGameEnd = async () => {
    stopGame();
    setGameState("won");

    // Avoid using stale state closures
    setScore(currentScore => {
      // Save telemetry asynchronously, it's safe to fire and forget here
      saveTelemetry("TeaLeafPlucker", currentScore, { time: 60 }).catch(e => 
        console.error("Failed to save telemetry:", e)
      );
      return currentScore;
    });
  };

  const handleTap = (id, type, points, e) => {
    if (!gameActive.current) return;

    // Prevent default to avoid double-firing on touch screens
    if (e) e.preventDefault();

    setItems((prev) => prev.filter(item => item.id !== id));
    
    if (type === "target" && e) {
      correctTapsRef.current += 1;
      
      // Show encouragement every 5-6 correct taps
      if (correctTapsRef.current >= 5) {
        if (correctTapsRef.current >= 6 || Math.random() > 0.5) {
          correctTapsRef.current = 0; // Reset counter
          
          const newText = {
            id: Math.random().toString(36).substring(2, 11),
            text: ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)],
            x: e.clientX,
            y: e.clientY
          };
          setFloatingTexts(prev => [...prev, newText]);
          setTimeout(() => {
            setFloatingTexts(prev => prev.filter(t => t.id !== newText.id));
          }, 1000);
        }
      }
    }
    
    setScore((prev) => {
      const newScore = prev + points;
      return newScore < 0 ? 0 : newScore; // Floor at 0
    });
  };

  const handleMiss = (id, type) => {
    if (!gameActive.current) return;
    
    setItems((prev) => prev.filter(item => item.id !== id));
    
    // Penalize if they miss a premium leaf
    if (type === "target") {
      setScore((prev) => {
        const newScore = prev - 20;
        return newScore < 0 ? 0 : newScore;
      });
    }
  };

  return (
    <main className="min-h-dvh flex flex-col relative overflow-hidden bg-emerald-950">
      {/* ── Background ───────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[800px] h-[800px] rounded-full opacity-10 blur-3xl bg-green-400" />
      </div>

      <div className="relative z-10 flex flex-col flex-1 w-full max-w-lg mx-auto px-4 sm:px-6 py-6 sm:py-8 pointer-events-none">
        
        {/* ── Header ───────────────────────────── */}
        <header className="flex items-center justify-between mb-6 pointer-events-auto">
          <button
            onClick={() => router.push("/games")}
            className="w-12 h-12 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center text-white/90 hover:bg-white/20 hover:text-white transition-colors backdrop-blur-md"
            aria-label="Go Back"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white tracking-tight">Tea Leaf Plucker</h1>
            <p className="text-sm text-green-300 font-medium">Tap the fresh leaves 🌱 • Level {score >= 1000 ? 3 : (score >= 500 ? 2 : 1)}</p>
          </div>
          
          <div className="w-12 h-12" />
        </header>

        {/* ── Stats Row ────────────────────────── */}
        <div className="flex justify-between items-center px-6 py-4 bg-black/30 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl pointer-events-auto">
          <div className="flex flex-col">
            <span className="text-xs text-green-300 uppercase tracking-wider font-bold">Score</span>
            <span className="text-3xl font-black text-white drop-shadow-md">{score}</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-xs text-green-300 uppercase tracking-wider font-bold">Time Left</span>
            <span className={`text-3xl font-black drop-shadow-md ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
              {timeLeft}s
            </span>
          </div>
        </div>

      </div>

      {/* ── Falling Items Area ─────────────────── */}
      {/* This container covers the screen but sits behind the header (z-0) so header remains clickable */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {items.map((item) => (
          <button
            key={item.id}
            onPointerDown={(e) => handleTap(item.id, item.type, item.points, e)}
            onAnimationEnd={() => handleMiss(item.id, item.type)}
            className={`absolute top-0 animate-linear-fall pointer-events-auto touch-manipulation focus:outline-none ${item.type === 'weed' ? 'hue-rotate-180 brightness-75' : ''}`}
            style={{ 
              left: `${item.x}%`,
              animationDuration: `${item.duration}s`,
            }}
            aria-label={`Tap ${item.emoji}`}
          >
            <span 
              className="block text-8xl drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] active:scale-75 transition-transform"
              role="img" 
              aria-hidden="true"
            >
              {item.emoji}
            </span>
          </button>
        ))}
      </div>

      {/* ── Floating Texts Overlay ────────────── */}
      <div className="fixed inset-0 pointer-events-none z-50">
        {floatingTexts.map(t => (
          <div
            key={t.id}
            className="absolute text-3xl md:text-4xl font-black text-green-300 drop-shadow-xl animate-float-up whitespace-nowrap"
            style={{ left: t.x, top: t.y }}
          >
            {t.text}
          </div>
        ))}
      </div>

      {/* ── Win Overlay ──────────────────────── */}
      {gameState === "won" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-lg p-6 animate-fade-in pointer-events-auto">
          <div className="bg-[#0f1c16] rounded-3xl p-8 shadow-2xl text-center max-w-sm w-full border border-green-500/30 animate-scale-in">
            <span className="text-7xl block mb-4">🏆</span>
            <h2 className="text-3xl font-black text-white mb-2">Time's Up!</h2>
            <p className="text-green-100/70 text-lg mb-6">Let's see how much tea you plucked.</p>
            
            <div className="bg-black/40 rounded-2xl p-6 mb-8 border border-white/5">
              <p className="text-sm text-green-400/80 uppercase tracking-widest font-bold">Final Score</p>
              <p className="text-6xl font-black text-green-400 my-2 drop-shadow-lg">
                {score}
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => router.push("/games")}
                className="flex-1 py-4 rounded-2xl bg-white/5 text-white font-bold hover:bg-white/10 transition-colors"
              >
                Exit
              </button>
              <button
                onClick={startGame}
                className="flex-1 py-4 rounded-2xl bg-green-500 text-black font-black hover:bg-green-400 shadow-lg shadow-green-500/20 transition-all active:scale-95"
              >
                Play Again
              </button>
            </div>
          </div>
        </div>
      )}
      
    </main>
  );
}
