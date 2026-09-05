"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// Utility to create a soft, relaxing chime sound
const playChime = (ctx, x, y, width, height) => {
  if (!ctx || ctx.state !== "running") return;
  
  // Map x/y to a pentatonic scale for pleasant harmony
  const baseFreq = 220; // A3
  const scale = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24]; // Major Pentatonic
  const noteIndex = Math.floor((1 - (y / height)) * scale.length);
  const safeIndex = Math.max(0, Math.min(scale.length - 1, noteIndex));
  const note = scale[safeIndex];
  
  const freq = baseFreq * Math.pow(2, note / 12);
  
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = "sine";
  osc.frequency.value = freq;
  
  // Soft attack and slow release
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.1);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2);
  
  // Spatial panning based on X coordinate
  const pan = (x / width) * 2 - 1; // -1 to 1
  const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
  
  osc.connect(gain);
  if (panner) {
    panner.pan.value = pan;
    gain.connect(panner);
    panner.connect(ctx.destination);
  } else {
    gain.connect(ctx.destination);
  }
  
  osc.start();
  osc.stop(ctx.currentTime + 2);
};

export default function MountainPainter() {
  const router = useRouter();
  const canvasRef = useRef(null);
  const audioCtxRef = useRef(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [brushColor, setBrushColor] = useState("#2A9D8F"); // Default green
  const [ctx2d, setCtx2d] = useState(null);

  const colors = [
    { label: "Terracotta", hex: "#E07A5F" },
    { label: "Yellow", hex: "#F4A261" },
    { label: "Sage", hex: "#81B29A" },
    { label: "Teal", hex: "#2A9D8F" },
    { label: "Navy", hex: "#3D5A80" },
    { label: "Plum", hex: "#985277" },
    { label: "Cream", hex: "#F1FAEE" },
  ];

  // Initialize Canvas & Audio
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Fit to container
    const resize = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const context = canvas.getContext("2d");
    context.lineCap = "round";
    context.lineJoin = "round";
    setCtx2d(context);

    // Audio Context (must be resumed on first user interaction)
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtxRef.current = new AudioContext();

    return () => {
      window.removeEventListener("resize", resize);
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

  const initAudio = () => {
    if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
  };

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    if (e.touches && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    initAudio();
    setIsDrawing(true);
    setHasDrawn(true);
    const { x, y } = getCoordinates(e);
    if (ctx2d) {
      ctx2d.beginPath();
      ctx2d.moveTo(x, y);
      ctx2d.lineWidth = 14; // Uniform comfortable brush size
      ctx2d.strokeStyle = brushColor;
    }
    // Play a chime on initial touch
    playChime(audioCtxRef.current, x, y, canvasRef.current.width, canvasRef.current.height);
  };

  const draw = (e) => {
    if (!isDrawing || !ctx2d) return;
    const { x, y } = getCoordinates(e);
    ctx2d.lineTo(x, y);
    ctx2d.stroke();
    
    // Occasionally play chimes while dragging for a "flowing stream" or "wind" effect
    if (Math.random() < 0.05) {
      playChime(audioCtxRef.current, x, y, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (ctx2d) ctx2d.closePath();
  };

  const clearCanvas = () => {
    if (ctx2d && canvasRef.current) {
      ctx2d.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      setHasDrawn(false);
    }
  };

  return (
    <main className="min-h-dvh flex flex-col relative bg-elder-canvas">
      {/* Header */}
      <header className="flex items-center justify-between p-5 pb-0 relative z-10">
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
          <h1 className="text-xl font-bold text-elder-text">Soundscape Painter</h1>
        </div>
        
        <button 
          onClick={clearCanvas}
          className="px-4 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center font-bold text-elder-sos active:scale-95"
        >
          Reset
        </button>
      </header>

      {/* Palette */}
      <div className="flex justify-center flex-wrap gap-3 p-4 relative z-10">
        {colors.map(color => (
          <button
            key={color.label}
            onClick={() => setBrushColor(color.hex)}
            className={`w-12 h-12 rounded-full shadow-sm border-4 transition-transform active:scale-95 ${
              brushColor === color.hex ? "scale-110 border-elder-navy" : "border-transparent"
            }`}
            style={{ backgroundColor: color.hex }}
            aria-label={`Select ${color.label} color`}
          />
        ))}
      </div>

      {/* Canvas Area */}
      <div className="flex-1 relative m-4 mt-0 bg-[#A8DADC] rounded-3xl shadow-inner overflow-hidden border-4 border-white">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full touch-none cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        
        {/* Placeholder instruction if canvas is empty */}
        {!hasDrawn && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-50">
            <p className="text-xl font-bold text-[#1D3557]">Touch and drag to paint...</p>
          </div>
        )}
      </div>
    </main>
  );
}
