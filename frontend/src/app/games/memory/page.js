"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { saveTelemetry } from "../../../lib/db";

// 8 Emojis max (16 cards) for Level 3
const ALL_EMOJIS = ["🍎", "🚗", "🐶", "🌻", "🎈", "🏠", "🍕", "🎸"];

// Helper to shuffle the deck based on level
function generateDeck(level) {
  const pairsCount = level === 1 ? 4 : (level === 2 ? 6 : 8);
  const subset = ALL_EMOJIS.slice(0, pairsCount);
  const deck = [...subset, ...subset];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck.map((emoji) => ({ 
    id: Math.random().toString(36).substr(2, 9), 
    emoji, 
    isFlipped: false, 
    isMatched: false 
  }));
}

export default function MemoryMatch() {
  const router = useRouter();
  
  const [deck, setDeck] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]); // stores indices
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  
  const [isLocked, setIsLocked] = useState(false);
  const [gameState, setGameState] = useState("playing"); // 'playing', 'won'
  
  // Timer state
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef(null);

  const [level, setLevel] = useState(1);
  
  // Initialize the game
  useEffect(() => {
    startNewGame(1);
    return () => clearInterval(timerRef.current);
  }, []);

  const startNewGame = (lvl = 1) => {
    setLevel(lvl);
    setDeck(generateDeck(lvl));
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setGameState("playing");
    setSeconds(0);
    
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
  };

  // Format time (e.g., 01:15)
  const formatTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
    const s = (totalSeconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleCardClick = (index) => {
    // Prevent clicking if locked, already flipped, or matched
    if (isLocked) return;
    if (deck[index].isFlipped || deck[index].isMatched) return;
    if (gameState !== "playing") return;

    // Flip the chosen card
    const newDeck = [...deck];
    newDeck[index].isFlipped = true;
    setDeck(newDeck);

    const newFlipped = [...flippedCards, index];
    setFlippedCards(newFlipped);

    // If we just flipped the second card in a pair
    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      setIsLocked(true); // Lock the board while animating

      const [firstIndex, secondIndex] = newFlipped;
      
      // Match!
      if (newDeck[firstIndex].emoji === newDeck[secondIndex].emoji) {
        newDeck[firstIndex].isMatched = true;
        newDeck[secondIndex].isMatched = true;
        setDeck(newDeck);
        setFlippedCards([]);
        setIsLocked(false);
        
        const newMatches = matches + 1;
        setMatches(newMatches);
        
        // Did they win?
        if (newMatches === newDeck.length / 2) {
          handleWin(newMoves => moves + 1);
        }
      } else {
        // No match... wait 1.5s for elderly users to process, then flip back
        setTimeout(() => {
          const resetDeck = [...deck];
          resetDeck[firstIndex].isFlipped = false;
          resetDeck[secondIndex].isFlipped = false;
          setDeck(resetDeck);
          setFlippedCards([]);
          setIsLocked(false);
        }, 1500);
      }
    }
  };

  const handleWin = async () => {
    clearInterval(timerRef.current);
    setGameState("won");
    
    // Calculate a nice positive score
    // Baseline 1000. Deduct 10 per move, deduct 2 per second. Floor at 100.
    // wait, moves is updated asynchronously in state, so we use the expected moves count:
    const finalMoves = moves + 1; 
    let score = 1000 - (finalMoves * 10) - (seconds * 2);
    if (score < 100) score = 100;
    
    // Save to our Stage 2A pipeline
    try {
      await saveTelemetry("MemoryMatch", score, { moves: finalMoves, seconds });
    } catch (e) {
      console.error("Failed to save telemetry:", e);
    }
  };

  return (
    <main className="min-h-dvh flex flex-col relative overflow-hidden bg-[#FDFBF7]">


      <div className="relative z-10 flex flex-col flex-1 w-full max-w-lg mx-auto px-5 sm:px-6 py-6 sm:py-8">
        
        {/* ── Header ───────────────────────────── */}
        <header className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push("/")}
            className="w-12 h-12 bg-[#E3D5CA] border-2 border-[#2D2D2D] rounded-2xl flex items-center justify-center text-[#2D2D2D] hover:bg-[#d5c3b5] transition-colors"
            aria-label="Go Back"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="text-center">
            <h1 className="text-2xl font-black text-[#2D2D2D] tracking-tight">Memory Match</h1>
            <p className="text-sm text-[#2D2D2D] font-bold">Find the pairs • Level {level}</p>
          </div>
          
          {/* Invisible placeholder for centering */}
          <div className="w-12 h-12" />
        </header>

        {/* ── Stats Row ────────────────────────── */}
        <div className="flex justify-between items-center mb-8 px-4 py-3 bg-[#E3D5CA] rounded-2xl border-2 border-[#2D2D2D]">
          <div className="flex flex-col">
            <span className="text-xs text-[#2D2D2D] uppercase tracking-wider font-bold">Moves</span>
            <span className="text-xl font-black text-[#2D2D2D]">{moves}</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-xs text-[#2D2D2D] uppercase tracking-wider font-bold">Time</span>
            <span className="text-xl font-black text-[#2D2D2D]">{formatTime(seconds)}</span>
          </div>
        </div>

        {/* ── Game Board (4-Column Grid) ────────────── */}
        <div className="grid grid-cols-4 gap-4 mb-8 flex-1 content-center">
          {deck.map((card, index) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(index)}
              className="relative aspect-square w-full rounded-2xl perspective-1000"
              aria-label={card.isFlipped || card.isMatched ? `Card ${card.emoji}` : "Hidden card"}
            >
              <div
                className={`w-full h-full transition-transform duration-500 transform-style-3d ${
                  card.isFlipped || card.isMatched ? "rotate-y-180" : ""
                }`}
              >
                {/* Front (Hidden state) */}
                <div className="absolute inset-0 backface-hidden bg-teal-700 rounded-2xl shadow-none border-2 border-[#2D2D2D] flex items-center justify-center">
                  <span className="text-3xl text-[#FDFBF7] font-bold block">?</span>
                </div>

                {/* Back (Revealed state) */}
                <div
                  className={`absolute inset-0 backface-hidden rotate-y-180 rounded-2xl shadow-none flex items-center justify-center text-5xl border-2 border-[#2D2D2D] ${
                    card.isMatched
                      ? "bg-[#D96C5B]"
                      : "bg-[#FDFBF7]"
                  }`}
                >
                  <span
                    className={card.isMatched ? "animate-bounce" : ""}
                    style={{ animationDuration: "1s" }}
                  >
                    {card.emoji}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* ── Win Overlay ──────────────────────── */}
        {gameState === "won" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#FDFBF7]/90 backdrop-blur-sm p-6" style={{ animation: "fade-in 0.3s ease-out both" }}>
            <div className="bg-[#E3D5CA] rounded-3xl p-8 shadow-none text-center max-w-sm w-full border-2 border-[#2D2D2D]" style={{ animation: "scale-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) both" }}>
              <span className="text-7xl block mb-4">🎉</span>
              <h2 className="text-3xl font-black text-[#2D2D2D] mb-2">Great Job!</h2>
              <p className="text-[#2D2D2D] font-bold text-lg mb-6">You found all the pairs!</p>
              
              <div className="bg-[#FDFBF7] border-2 border-[#2D2D2D] rounded-2xl p-4 mb-8">
                <p className="text-sm text-[#2D2D2D] font-bold uppercase tracking-wide">Score</p>
                <p className="text-4xl font-black text-[#2D2D2D] my-1">
                  {Math.max(100, 1000 - ((moves) * 10) - (seconds * 2))}
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => router.push("/games")}
                  className="flex-1 py-4 rounded-2xl bg-[#FDFBF7] border-2 border-[#2D2D2D] text-[#2D2D2D] font-bold hover:bg-[#d5c3b5] transition-colors"
                >
                  Exit
                </button>
                {level < 3 ? (
                  <button
                    onClick={() => startNewGame(level + 1)}
                    className="flex-1 py-4 rounded-2xl bg-teal-700 border-2 border-[#2D2D2D] text-[#FDFBF7] font-black hover:bg-teal-800 shadow-none transition-all"
                  >
                    Next Level
                  </button>
                ) : (
                  <button
                    onClick={() => startNewGame(1)}
                    className="flex-1 py-4 rounded-2xl bg-teal-700 border-2 border-[#2D2D2D] text-[#FDFBF7] font-black hover:bg-teal-800 shadow-none transition-all"
                  >
                    Play Again
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        
      </div>
      
    </main>
  );
}
