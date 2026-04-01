"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ExecutionMirror } from "@/components/ExecutionMirror";
import {
  Sparkles, ShieldAlert, Coffee, CheckCircle,
  Timer, Play, Pause, SkipForward, Volume2, VolumeX, Clock
} from "lucide-react";

// ── Kinetic Timer (enhanced with pause + break support) ──────────────────────
function EnhancedTimer({
  totalSeconds,
  onComplete,
  onTick,
  isPaused,
}: {
  totalSeconds: number;
  onComplete: () => void;
  onTick: (elapsed: number) => void;
  isPaused: boolean;
}) {
  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const elapsedRef = useRef(0);

  useEffect(() => {
    setTimeLeft(totalSeconds);
    elapsedRef.current = 0;
  }, [totalSeconds]);

  useEffect(() => {
    if (isPaused || timeLeft <= 0) return;
    const id = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(id); onComplete(); return 0; }
        return t - 1;
      });
      elapsedRef.current += 1;
      onTick(elapsedRef.current);
    }, 1000);
    return () => clearInterval(id);
  }, [isPaused, timeLeft, onComplete, onTick]);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const progress = 1 - timeLeft / totalSeconds;
  const scale = 1 + progress * 0.4;
  const isUrgent = timeLeft < 60 && timeLeft > 0;
  const pct = Math.round(progress * 100);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Circular progress ring */}
      <div className="relative" style={{ width: 240, height: 240 }}>
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 240 240">
          <circle cx="120" cy="120" r="108" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
          <circle
            cx="120" cy="120" r="108" fill="none"
            stroke={isUrgent ? "rgba(239,68,68,0.8)" : "rgba(139,92,246,0.8)"}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 108}`}
            strokeDashoffset={`${2 * Math.PI * 108 * (1 - progress)}`}
            style={{ transition: "stroke-dashoffset 1s linear, stroke 0.5s" }}
          />
        </svg>
        <motion.div
          animate={{ scale: isPaused ? 1 : scale }}
          transition={{ type: "tween", ease: "linear", duration: 1 }}
          className={`absolute inset-0 flex items-center justify-center font-mono font-black ${isUrgent ? "text-red-400" : "text-foreground"}`}
          style={{ fontSize: "clamp(2.5rem, 8vw, 4.5rem)" }}
        >
          {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
        </motion.div>
      </div>
      <div className="text-foreground/40 text-sm font-mono">{pct}% elapsed</div>
    </div>
  );
}

// ── Time Picker Modal ─────────────────────────────────────────────────────────
function TimePickerModal({ onStart }: { onStart: (mins: number) => void }) {
  const [mins, setMins] = useState(25);
  const presets = [5, 10, 15, 25, 30, 45, 60, 90];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
    >
      <div className="bg-[#0d0d1a] border border-violet-500/30 rounded-3xl p-8 w-full max-w-md shadow-[0_0_80px_rgba(139,92,246,0.3)]">
        <div className="flex items-center gap-3 mb-6">
          <Timer size={22} className="text-violet-400" />
          <h2 className="font-black text-xl">Set Your Timer</h2>
        </div>
        <p className="text-foreground/50 text-sm mb-6">
          How long will you commit to this task?
        </p>

        {/* Preset chips */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {presets.map(p => (
            <button
              key={p}
              onClick={() => setMins(p)}
              className={`py-3 rounded-2xl font-bold text-sm transition-all border ${
                mins === p
                  ? "bg-gradient-to-br from-violet-600 to-blue-600 border-transparent text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]"
                  : "border-white/10 text-foreground/60 hover:border-violet-500/40 hover:text-foreground"
              }`}
            >
              {p}m
            </button>
          ))}
        </div>

        {/* Custom input */}
        <div className="flex items-center gap-3 mb-8">
          <span className="text-foreground/40 text-sm uppercase tracking-wider">Custom:</span>
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
            <input
              type="number"
              min={1}
              max={240}
              value={mins}
              onChange={e => setMins(Math.max(1, Math.min(240, Number(e.target.value))))}
              className="w-16 bg-transparent text-foreground text-center font-black text-xl focus:outline-none"
            />
            <span className="text-foreground/40 text-sm">minutes</span>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onStart(mins)}
          className="w-full py-5 bg-gradient-to-r from-violet-600 to-blue-600 text-white font-black rounded-2xl text-lg tracking-wider uppercase flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(139,92,246,0.5)]"
        >
          <Play size={22} fill="white" />
          Lock In & Start
        </motion.button>
      </div>
    </motion.div>
  );
}

// ── Break Overlay ─────────────────────────────────────────────────────────────
function BreakOverlay({
  breakSeconds,
  onResume,
}: {
  breakSeconds: number;
  onResume: () => void;
}) {
  const m = Math.floor(breakSeconds / 60);
  const s = breakSeconds % 60;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-black/85 backdrop-blur-lg"
    >
      <Coffee size={64} className="text-amber-400 mb-6 animate-pulse" />
      <h2 className="text-3xl font-black mb-2">On a Break</h2>
      <p className="text-foreground/50 mb-8">Rest. The work waits for you.</p>
      <div className="font-mono text-5xl font-black text-amber-400 mb-10">
        {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
      </div>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onResume}
        className="flex items-center gap-3 px-10 py-4 bg-amber-500 text-black font-black rounded-2xl text-lg uppercase tracking-wider shadow-[0_0_30px_rgba(251,191,36,0.4)]"
      >
        <Play size={22} fill="black" /> Resume Mission
      </motion.button>
    </motion.div>
  );
}

// ── Main Tunnel ───────────────────────────────────────────────────────────────
function TunnelContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const title = searchParams.get("title") || "Focus Session";
  const taskId = searchParams.get("id");

  const [phase, setPhase] = useState<"PICK_TIME" | "ACTIVE" | "BREAK" | "COMPLETED" | "FAILED">("PICK_TIME");
  const [allocatedMins, setAllocatedMins] = useState(25);
  const [isPaused, setIsPaused] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [coachMessage, setCoachMessage] = useState("Lock in. Zero distractions.");

  // Time accounting
  const elapsedRef = useRef(0);            // active seconds
  const breakStartRef = useRef(0);         // timestamp when break started
  const totalBreakSecondsRef = useRef(0);  // accumulated break time
  const [breakDisplaySecs, setBreakDisplaySecs] = useState(0);

  // Idle tracker (2-min rescue)
  const [idleTime, setIdleTime] = useState(0);
  const [showRescuePopup, setShowRescuePopup] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "flow");
    return () => document.documentElement.removeAttribute("data-theme");
  }, []);

  // Idle tracking
  useEffect(() => {
    if (phase !== "ACTIVE" || isPaused || showRescuePopup) return;
    const interval = setInterval(() => setIdleTime(p => p + 1), 1000);
    const reset = () => setIdleTime(0);
    window.addEventListener("mousemove", reset);
    window.addEventListener("keydown", reset);
    return () => { clearInterval(interval); window.removeEventListener("mousemove", reset); window.removeEventListener("keydown", reset); };
  }, [phase, isPaused, showRescuePopup]);

  useEffect(() => {
    if (idleTime >= 10 && !showRescuePopup && phase === "ACTIVE") {
      setShowRescuePopup(true);
      setCoachMessage("Too big? I'll simplify it.");
    }
  }, [idleTime, showRescuePopup, phase]);

  // Break timer tick
  useEffect(() => {
    if (phase !== "BREAK") return;
    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - breakStartRef.current) / 1000);
      setBreakDisplaySecs(elapsed);
    }, 1000);
    return () => clearInterval(id);
  }, [phase]);

  const handleStartTimer = (mins: number) => {
    setAllocatedMins(mins);
    setPhase("ACTIVE");
    if (taskId) {
      fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, action: "START" }),
      });
    }
  };

  const handleComplete = async () => {
    setPhase("COMPLETED");
    setCoachMessage("Momentum created. Keep going.");
    if (taskId) {
      await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId,
          action: "COMPLETE",
          actualSeconds: elapsedRef.current,
          breakSeconds: totalBreakSecondsRef.current,
        }),
      });
    }
  };

  const handleFail = async () => {
    if (!window.confirm("Abort mission? This breaks your streak and adds you to the Wall of Shame.")) return;
    setPhase("FAILED");
    if (taskId) {
      await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, action: "FAIL" }),
      });
    }
    router.push("/shame");
  };

  const handleBreak = () => {
    setPhase("BREAK");
    setIsPaused(true);
    breakStartRef.current = Date.now();
    setBreakDisplaySecs(0);
    setCoachMessage("Rest is part of the process.");
  };

  const handleResume = () => {
    const secs = Math.floor((Date.now() - breakStartRef.current) / 1000);
    totalBreakSecondsRef.current += secs;
    setPhase("ACTIVE");
    setIsPaused(false);
    setIdleTime(0);
    setCoachMessage("Back to work. Don't think. Just go.");
  };

  const acceptRescue = () => {
    setAllocatedMins(2);
    setShowRescuePopup(false);
    setIdleTime(0);
    setCoachMessage("2-Minute version activated. GO.");
  };

  if (phase === "COMPLETED") {
    return (
      <ExecutionMirror
        title={title}
        timeSpent={elapsedRef.current}
        onReturn={() => router.push("/")}
      />
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-6 md:p-10 relative overflow-hidden bg-background">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.15),transparent_70%)]" />

      {/* Time picker */}
      {phase === "PICK_TIME" && <TimePickerModal onStart={handleStartTimer} />}

      {/* Break overlay */}
      <AnimatePresence>
        {phase === "BREAK" && (
          <BreakOverlay breakSeconds={breakDisplaySecs} onResume={handleResume} />
        )}
      </AnimatePresence>

      {/* 2-Min Rescue popup */}
      <AnimatePresence>
        {showRescuePopup && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.85 }} animate={{ scale: 1 }}
              className="bg-[#0d0d1a] border-2 border-orange-500/50 p-8 rounded-3xl max-w-md text-center shadow-[0_0_80px_rgba(255,106,0,0.3)]"
            >
              <h3 className="text-orange-400 font-black text-xl uppercase tracking-widest mb-3">Mental Resistance Detected</h3>
              <p className="text-foreground/70 text-lg italic mb-8">"10 seconds of hesitation. Start the 2-minute version instead."</p>
              <div className="flex flex-col gap-3">
                <button onClick={acceptRescue} className="w-full py-4 bg-orange-500 text-black font-black rounded-2xl hover:bg-orange-400 transition-colors uppercase tracking-wider text-lg">
                  1-Click Rescue (2 Mins)
                </button>
                <button onClick={() => { setShowRescuePopup(false); setIdleTime(0); }} className="py-3 text-foreground/40 hover:text-foreground font-bold uppercase tracking-widest text-sm transition-colors">
                  Keep original mode
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="w-full flex justify-between items-center z-10 max-w-6xl mx-auto">
        <div className="flex items-center gap-3 bg-white/5 px-4 py-2.5 rounded-full border border-white/10">
          <div className="w-2.5 h-2.5 rounded-full bg-violet-400 animate-ping" />
          <span className="text-sm font-bold uppercase tracking-widest text-foreground/80">The Tunnel</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Break button */}
          {phase === "ACTIVE" && (
            <button
              onClick={handleBreak}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-all text-sm font-bold uppercase tracking-wider"
            >
              <Coffee size={16} /> Take a Break
            </button>
          )}
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className="p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-foreground transition-all"
          >
            {audioEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
        </div>
      </header>

      {/* Center: task name + timer */}
      <div className="flex-1 flex flex-col items-center justify-center w-full z-10 gap-10">
        {/* Coach message */}
        <motion.div
          key={coachMessage}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 bg-white/5 border border-white/10 px-5 py-3 rounded-full backdrop-blur-md"
        >
          <Sparkles size={14} className="text-violet-400" />
          <span className="text-sm font-bold uppercase tracking-widest text-foreground/70">{coachMessage}</span>
        </motion.div>

        <h1 className="text-3xl md:text-5xl font-black text-center max-w-3xl leading-tight text-foreground">
          {title}
        </h1>

        {phase === "ACTIVE" && (
          <EnhancedTimer
            key={allocatedMins}
            totalSeconds={allocatedMins * 60}
            isPaused={isPaused}
            onComplete={handleComplete}
            onTick={(s) => { elapsedRef.current = s; }}
          />
        )}

        {/* Time stats bar */}
        {phase === "ACTIVE" && (
          <div className="flex items-center gap-6 text-foreground/40 text-xs font-mono uppercase tracking-widest">
            <span className="flex items-center gap-1.5">
              <Clock size={12} /> Allocated: {allocatedMins}m
            </span>
            <span className="text-foreground/20">|</span>
            <span className="flex items-center gap-1.5 text-amber-400/60">
              <Coffee size={12} /> Breaks: {Math.floor(totalBreakSecondsRef.current / 60)}m {totalBreakSecondsRef.current % 60}s
            </span>
          </div>
        )}

        {/* Complete button */}
        {phase === "ACTIVE" && (
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleComplete}
            className="flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-violet-600 to-blue-600 text-white font-black rounded-2xl text-lg uppercase tracking-wider shadow-[0_0_40px_rgba(139,92,246,0.4)] hover:shadow-[0_0_60px_rgba(139,92,246,0.6)] transition-all"
          >
            <CheckCircle size={24} /> Mark Complete
          </motion.button>
        )}
      </div>

      {/* Footer: abort */}
      <div className="z-10 w-full flex justify-center pb-4">
        <button
          onDoubleClick={handleFail}
          className="group flex items-center gap-3 px-6 py-3 rounded-full border border-red-500/20 text-red-500/50 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/40 hover:shadow-[0_0_30px_rgba(239,68,68,0.3)] transition-all text-xs font-bold tracking-widest uppercase"
        >
          <ShieldAlert size={16} />
          <span className="group-hover:hidden">Double-click to Abort</span>
          <span className="hidden group-hover:inline">Confirm — adds to Wall of Shame</span>
        </button>
      </div>
    </main>
  );
}

export default function TunnelPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-t-2 border-violet-500 animate-spin" />
          <p className="text-foreground/50 uppercase tracking-widest text-sm font-bold">Entering the Tunnel...</p>
        </div>
      </div>
    }>
      <TunnelContent />
    </Suspense>
  );
}
