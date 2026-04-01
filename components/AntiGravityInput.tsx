"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

interface Props {
  onIdeaSubmit: (idea: string) => void;
}

export function AntiGravityInput({ onIdeaSubmit }: Props) {
  const [idea, setIdea] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (idea.trim()) {
      onIdeaSubmit(idea.trim());
      setIdea("");
    }
  };

  return (
    <motion.div
      layoutId="task-wrapper"
      className="w-full max-w-2xl mx-auto"
    >
      <form onSubmit={handleSubmit} className="relative w-full group">
        {/* Glowing underline */}
        <div className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-violet-500 via-blue-500 to-violet-500 transition-all duration-500 rounded-full shadow-[0_0_12px_rgba(139,92,246,0.6)] ${isFocused || idea ? "w-full" : "w-0"}`} />

        <div className="relative flex items-center">
          <Sparkles
            size={20}
            className={`absolute left-0 shrink-0 transition-all duration-300 ${isFocused || idea ? "text-violet-400 opacity-100" : "text-foreground/20 opacity-60"}`}
          />

          <motion.input
            layoutId="task-title"
            ref={inputRef}
            type="text"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="What must be executed today?"
            data-anti-gravity-input="true"
            className="w-full bg-transparent border-b border-foreground/15 text-foreground text-xl md:text-2xl font-semibold pl-8 pr-14 py-4 focus:outline-none transition-all placeholder:text-foreground/25 placeholder:font-normal"
            autoFocus
          />

          <AnimatePresence>
            {idea && (
              <motion.button
                initial={{ opacity: 0, scale: 0.7, x: 10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.7, x: 10 }}
                type="submit"
                className="absolute right-0 flex items-center gap-1.5 bg-gradient-to-r from-violet-600 to-blue-600 text-white text-xs font-black px-4 py-2 rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] transition-all uppercase tracking-wider"
              >
                Execute
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </form>
    </motion.div>
  );
}
