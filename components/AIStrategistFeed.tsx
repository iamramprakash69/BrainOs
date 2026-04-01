"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Sparkles, ChevronRight, RefreshCw } from "lucide-react";

const DEFAULT_SUGGESTIONS = [
  { icon: "🎯", text: "Set a 90-day OKR aligned to this goal", tag: "Strategy" },
  { icon: "📊", text: "Build a feedback loop to measure progress weekly", tag: "Metrics" },
  { icon: "🤝", text: "Find an accountability partner in your network", tag: "Social" },
  { icon: "📅", text: "Block 2-hour focus sessions on your calendar", tag: "Scheduling" },
  { icon: "🧪", text: "Run a 7-day experiment before committing fully", tag: "Validation" },
];

function generateSuggestions(idea: string | null) {
  if (!idea) return DEFAULT_SUGGESTIONS;
  const lower = idea.toLowerCase();
  if (lower.includes("fit") || lower.includes("workout") || lower.includes("gym")) {
    return [
      { icon: "💪", text: "Schedule morning workouts as non-negotiables", tag: "Habit" },
      { icon: "🥗", text: "Track macros for the first 7 days only", tag: "Nutrition" },
      { icon: "📈", text: "Log one metric daily: weight or reps", tag: "Data" },
      { icon: "🤝", text: "Join a 30-day fitness challenge online", tag: "Social" },
      { icon: "😴", text: "Optimize sleep — recovery drives results", tag: "Recovery" },
    ];
  }
  if (lower.includes("startup") || lower.includes("business") || lower.includes("pitch")) {
    return [
      { icon: "📋", text: "Draft a one-page problem statement today", tag: "Clarity" },
      { icon: "🔧", text: "Set up GitHub repository and project board", tag: "Dev" },
      { icon: "🎤", text: "Practice your 30-second pitch daily", tag: "Sales" },
      { icon: "💬", text: "Interview 5 potential users this week", tag: "Research" },
      { icon: "💰", text: "Define your revenue model before building", tag: "Finance" },
    ];
  }
  if (lower.includes("learn") || lower.includes("study") || lower.includes("english")) {
    return [
      { icon: "🗣️", text: "Practice speaking aloud daily for 10 minutes", tag: "Habit" },
      { icon: "📚", text: "Use spaced repetition for new vocabulary", tag: "Method" },
      { icon: "🎧", text: "Immerse yourself with native audio content", tag: "Immersion" },
      { icon: "✍️", text: "Write one short paragraph every morning", tag: "Writing" },
      { icon: "📱", text: "Change your phone language to target language", tag: "Environment" },
    ];
  }
  return DEFAULT_SUGGESTIONS;
}

interface Props {
  activeIdea: string | null;
}

export function AIStrategistFeed({ activeIdea }: Props) {
  const [suggestions, setSuggestions] = useState(DEFAULT_SUGGESTIONS);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [typingLine, setTypingLine] = useState("");

  useEffect(() => {
    setSuggestions(generateSuggestions(activeIdea));
  }, [activeIdea]);

  const refreshSuggestions = async () => {
    setIsRefreshing(true);
    await new Promise(r => setTimeout(r, 900));
    setSuggestions(prev => [...prev].sort(() => Math.random() - 0.5));
    setIsRefreshing(false);
  };

  // Simulate live typing for the leading AI message
  const fullMessage = activeIdea
    ? `Based on "${activeIdea}", here's what my analysis recommends:`
    : "Enter an idea above to get personalized AI strategy suggestions.";

  useEffect(() => {
    setTypingLine("");
    let i = 0;
    const interval = setInterval(() => {
      setTypingLine(fullMessage.slice(0, i));
      i++;
      if (i > fullMessage.length) clearInterval(interval);
    }, 25);
    return () => clearInterval(interval);
  }, [fullMessage]);

  return (
    <div className="flex flex-col h-full bg-background/60 border border-foreground/10 rounded-3xl overflow-hidden backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-foreground/10 bg-foreground/3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shadow-lg">
            <Bot size={18} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-sm">AI Strategist</p>
            <p className="text-foreground/40 text-xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
              Live Analysis
            </p>
          </div>
        </div>
        <button
          onClick={refreshSuggestions}
          disabled={isRefreshing}
          className="p-2 rounded-lg hover:bg-foreground/10 text-foreground/40 hover:text-foreground transition-all"
        >
          <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Typing prompt */}
      <div className="p-5 border-b border-foreground/5">
        <p className="text-xs text-foreground/50 leading-relaxed font-mono min-h-[2.5rem]">
          {typingLine}
          <span className="animate-pulse">█</span>
        </p>
      </div>

      {/* Suggestions list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
        <AnimatePresence mode="popLayout">
          {suggestions.map((s, idx) => (
            <motion.div
              key={idx}
              layout
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ delay: idx * 0.06 }}
              onClick={() => setActiveIndex(activeIndex === idx ? null : idx)}
              className={`group flex items-start gap-3 p-3 rounded-2xl cursor-pointer transition-all border ${
                activeIndex === idx
                  ? "bg-violet-500/10 border-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.1)]"
                  : "border-transparent hover:bg-foreground/5 hover:border-foreground/10"
              }`}
            >
              <span className="text-2xl leading-none mt-0.5 shrink-0">{s.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground/90 leading-snug">{s.text}</p>
                <span className="inline-block mt-1.5 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-foreground/8 text-foreground/40">
                  {s.tag}
                </span>
              </div>
              <ChevronRight
                size={14}
                className={`shrink-0 mt-1 text-foreground/30 transition-transform ${activeIndex === idx ? "rotate-90" : "group-hover:translate-x-0.5"}`}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Footer CTA */}
      <div className="p-4 border-t border-foreground/10">
        <div className="flex items-center gap-2 text-xs text-foreground/40">
          <Sparkles size={12} className="text-violet-400" />
          <span>Suggestions update with each new idea</span>
        </div>
      </div>
    </div>
  );
}
