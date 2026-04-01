"use client";

import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";

export function ExecutionMirror({ title, timeSpent, onReturn }: { title: string, timeSpent: number, onReturn: () => void }) {
  const [reflection, setReflection] = useState<string>("Analyzing your compound momentum...");

  useEffect(() => {
    async function fetchReflection() {
      try {
        const res = await fetch("/api/mirror", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            timeSpent,
            streak: 3, // Mocked streak for now
            frictionScore: "Low",
          }),
        });
        const data = await res.json();
        setReflection(data.message);
      } catch (err) {
        setReflection("At this rate of focus, you will compound 3x more execution this week. The Action-Gap is eliminated.");
      }
    }
    fetchReflection();
  }, [title, timeSpent]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center w-full min-h-screen p-8 text-center max-w-3xl mx-auto space-y-12"
    >
      <motion.div 
        animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 1, ease: "easeInOut" }}
        className="text-primary-base drop-shadow-[0_0_40px_var(--color-primary-glow)]"
      >
        <CheckCircle size={100} strokeWidth={1.5} />
      </motion.div>
      
      <div className="space-y-6">
        <h2 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-foreground to-primary-base leading-tight">
          Momentum at 110%
        </h2>
        <p className="text-xl md:text-3xl text-foreground/80 font-light">
          You executed "{title}" without hesitation.
        </p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-8 bg-foreground/5 backdrop-blur-xl rounded-2xl border border-primary-glow/40 mt-12 shadow-[0_0_60px_var(--color-primary-glow)]"
        >
          <p className="italic text-foreground text-xl leading-relaxed whitespace-pre-wrap">
            "{reflection}"
          </p>
          <div className="mt-8 pt-4 border-t border-foreground/10 flex justify-between text-sm text-foreground/50 uppercase tracking-widest font-bold">
            <span>Friction: Low</span>
            <span>Focus: Absolute</span>
          </div>
        </motion.div>
      </div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        onClick={onReturn}
        className="px-12 py-5 mt-12 rounded-full bg-foreground text-background font-bold tracking-widest uppercase hover:scale-[1.05] transition-transform shadow-xl"
      >
        Continue Execution
      </motion.button>
    </motion.div>
  );
}
