"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const SCENARIOS = [
  {
    id: 1,
    text: "It's the first day of Bihu! The sweet smell of pitha fills the air, and everyone is gathering to dance in the open fields. How do you feel?",
    emotion: "Happy",
  },
  {
    id: 2,
    text: "You are sitting quietly on the porch during the Hornbill festival, listening to the gentle hum of traditional folk songs fading into the evening.",
    emotion: "Calm",
  },
  {
    id: 3,
    text: "A friend suddenly visits you during the harvest festival carrying a beautiful hand-woven shawl they made just for you!",
    emotion: "Surprised",
  },
  {
    id: 4,
    text: "The evening feast is ready. Your family sits together, sharing stories and laughter under the warm glow of the lanterns.",
    emotion: "Happy",
  }
];

const EMOTIONS = [
  { label: "Happy", emoji: "😊", color: "bg-amber-100 text-amber-700 border-amber-300" },
  { label: "Calm", emoji: "😌", color: "bg-teal-100 text-teal-700 border-teal-300" },
  { label: "Surprised", emoji: "😲", color: "bg-purple-100 text-purple-700 border-purple-300" }
];

export default function FestivalFaces() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [feedback, setFeedback] = useState(null); // 'correct', 'incorrect'
  const [score, setScore] = useState(0);

  const scenario = SCENARIOS[currentIndex];

  const speak = (text) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // slightly slower for better comprehension
    utterance.pitch = 1.1; // warm voice
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (scenario) {
      speak(scenario.text);
    }
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentIndex, scenario]);

  const handleSelectEmotion = (emotionLabel) => {
    if (feedback === "correct") return; // Prevent clicking during success animation

    if (emotionLabel === scenario?.emotion) {
      setFeedback("correct");
      setScore(s => s + 1);
      
      // Stop current speech, play success sound
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      
      setTimeout(() => {
        setFeedback(null);
        if (currentIndex < SCENARIOS.length - 1) {
          setCurrentIndex(i => i + 1);
        } else {
          // Game Complete
          setCurrentIndex(-1); 
        }
      }, 2000);
    } else {
      setFeedback("incorrect");
      setTimeout(() => setFeedback(null), 1000);
    }
  };

  // ── Game Complete View ──
  if (currentIndex === -1) {
    return (
      <main className="min-h-dvh flex flex-col relative bg-elder-canvas p-6 items-center justify-center text-center">
        <div className="bg-elder-card rounded-3xl p-8 shadow-xl max-w-md w-full animate-splash-logo-pop">
          <span className="text-7xl block mb-4">🎉</span>
          <h1 className="text-3xl font-black text-elder-navy mb-2">Wonderful!</h1>
          <p className="text-lg text-elder-text mb-6">You identified all the emotions perfectly.</p>
          <p className="text-2xl font-bold text-elder-teal mb-8">Score: {score} / {SCENARIOS.length}</p>
          <button
            onClick={() => router.push("/games")}
            className="w-full py-4 bg-elder-teal text-elder-card font-bold rounded-xl shadow-md text-lg active:scale-95 transition-transform"
          >
            Back to Games Hub
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh flex flex-col relative bg-elder-canvas">
      <div className="relative z-10 flex flex-col flex-1 w-full max-w-md mx-auto px-5 py-6">
        
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push("/games")}
            className="w-12 h-12 bg-white border border-elder-muted/20 shadow-sm rounded-2xl flex items-center justify-center text-elder-text hover:shadow-md transition-all active:scale-95"
            aria-label="Exit Game"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="text-center">
            <h1 className="text-xl font-bold text-elder-text">Festival Faces</h1>
            <p className="text-sm text-elder-teal font-bold">{currentIndex + 1} of {SCENARIOS.length}</p>
          </div>
          
          <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center font-bold text-elder-teal">
            {score}
          </div>
        </header>

        {/* Scenario Card */}
        <div className="bg-elder-card rounded-3xl shadow-md p-6 mb-8 text-center relative border border-elder-muted/10">
          {feedback === "correct" && (
             <div className="absolute inset-0 bg-green-500 rounded-3xl flex items-center justify-center z-20 animate-splash-logo-pop">
               <span className="text-6xl text-white">✅</span>
             </div>
          )}
          
          <button 
            onClick={() => speak(scenario?.text)}
            className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4 transition-all shadow-sm active:scale-95 ${
              isPlaying ? "bg-elder-teal text-white animate-pulse" : "bg-elder-canvas text-elder-teal"
            }`}
          >
            <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
          
          <p className="text-lg sm:text-xl font-bold text-elder-navy leading-relaxed">
            "{scenario?.text}"
          </p>
        </div>

        {/* Emotion Choices */}
        <h2 className="text-center font-bold text-elder-text mb-4 text-lg">How do you feel?</h2>
        
        <div className="grid grid-cols-3 gap-3">
          {EMOTIONS.map((emotion) => (
            <button
              key={emotion.label}
              onClick={() => handleSelectEmotion(emotion.label)}
              className={`flex flex-col items-center justify-center p-4 rounded-3xl border-2 transition-all active:scale-95 ${emotion.color} ${
                feedback === "incorrect" ? "opacity-50" : "hover:shadow-md"
              }`}
            >
              <span className="text-5xl mb-2 block">{emotion.emoji}</span>
              <span className="font-bold text-sm">{emotion.label}</span>
            </button>
          ))}
        </div>

      </div>
    </main>
  );
}
