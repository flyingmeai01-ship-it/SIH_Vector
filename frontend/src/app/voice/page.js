"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { saveTelemetry } from "../../lib/db";

export default function VoiceTalk() {
  const router = useRouter();
  
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [diaryEntry, setDiaryEntry] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check if browser supports Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      
      recognition.onresult = (event) => {
        let currentTranscript = "";
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript + " ";
        }
        setTranscript(currentTranscript);
      };
      
      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        if (event.error !== "no-speech") {
          setErrorMsg("Microphone error. Please try again.");
          setIsRecording(false);
        }
      };
      
      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    } else {
      setErrorMsg("Your browser doesn't support live speech-to-text. Please use Chrome or Edge.");
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      setErrorMsg("");
      setTranscript("");
      setDiaryEntry(null);
      try {
        recognitionRef.current?.start();
        setIsRecording(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const generateDiary = async () => {
    if (!transcript.trim()) return;
    
    setIsProcessing(true);
    try {
      const res = await fetch("/api/diary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      });
      
      const data = await res.json();
      
      if (res.ok && data.diary) {
        setDiaryEntry(data.diary);
        // Save to offline vault
        saveTelemetry("VoiceDiary", 100, { transcriptLength: transcript.length }).catch(console.error);
      } else {
        setErrorMsg("Hmm, we couldn't create the diary. Make sure you set your GEMINI_API_KEY!");
      }
    } catch (e) {
      setErrorMsg("Something went wrong communicating with the server.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-dvh flex flex-col relative bg-[#1c0f13] overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-[30%] left-[50%] -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-[0.15] blur-3xl bg-rose-500 animate-pulse" />
      </div>

      <div className="relative z-10 flex flex-col flex-1 w-full max-w-md md:max-w-2xl lg:max-w-4xl mx-auto px-5 py-6 sm:py-8 md:py-12">
        <header className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push("/")}
            className="w-12 h-12 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center text-white/90 hover:bg-white/20 transition-colors backdrop-blur-md"
            aria-label="Go Back"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white tracking-tight">Voice Talk</h1>
            <p className="text-sm text-rose-300 font-medium">Record your memories 🎙️</p>
          </div>
          
          <div className="w-12 h-12" />
        </header>

        {errorMsg && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-2xl mb-6 text-center text-sm font-medium">
            {errorMsg}
          </div>
        )}

        {/* State 1: Recording / Text Display */}
        {!diaryEntry && (
          <div className="flex flex-col flex-1">
            <div className="flex-1 bg-black/30 backdrop-blur-md rounded-3xl border border-white/10 p-6 flex flex-col shadow-2xl overflow-y-auto mb-8 min-h-[300px]">
              {transcript ? (
                <p className="text-xl sm:text-2xl text-white font-medium leading-relaxed">
                  "{transcript}"
                </p>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-rose-300/50 text-center">
                  <span className="text-6xl mb-4">🎤</span>
                  <p className="text-lg">Tap the microphone and start speaking about your day...</p>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex flex-col items-center gap-6 pb-6">
              <button
                onClick={toggleRecording}
                className={`w-28 h-28 rounded-full flex items-center justify-center text-5xl shadow-2xl transition-all duration-300 ${
                  isRecording 
                    ? "bg-red-500 shadow-red-500/50 animate-pulse scale-110" 
                    : "bg-gradient-to-br from-rose-500 to-pink-600 hover:scale-105"
                }`}
                aria-label={isRecording ? "Stop Recording" : "Start Recording"}
              >
                {isRecording ? "🛑" : "🎙️"}
              </button>
              
              <div className="h-14">
                {transcript && !isRecording && !isProcessing && (
                  <button
                    onClick={generateDiary}
                    className="px-8 py-4 bg-emerald-500 text-black font-black rounded-2xl shadow-lg shadow-emerald-500/20 animate-fade-in hover:bg-emerald-400 active:scale-95 transition-all"
                  >
                    Save to Diary ✨
                  </button>
                )}
                {isProcessing && (
                  <div className="text-rose-200 font-medium animate-pulse flex items-center gap-2 h-full">
                    <span className="text-xl">✨</span> Gemini is writing your diary...
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* State 2: Diary Generated */}
        {diaryEntry && (
          <div className="flex-1 flex flex-col animate-fade-in">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl mb-6 flex-1 text-slate-800">
              <h2 className="text-2xl font-black text-rose-600 mb-6 flex items-center gap-2">
                <span>📖</span> Today's Entry
              </h2>
              <div className="prose prose-rose prose-lg font-medium leading-relaxed" 
                   dangerouslySetInnerHTML={{ __html: diaryEntry.replace(/\n/g, '<br/>') }} />
            </div>
            
            <button
              onClick={() => {
                setDiaryEntry(null);
                setTranscript("");
              }}
              className="w-full py-4 bg-rose-600 text-white font-bold rounded-2xl shadow-lg hover:bg-rose-500 active:scale-95 transition-all"
            >
              Record Another Memory
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
