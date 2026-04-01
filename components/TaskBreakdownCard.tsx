"use client";

import { motion } from "framer-motion";
import { CheckCircle, Zap, Target } from "lucide-react";

interface TaskProps {
  title: string;
  futureProjection?: string;
  steps: string[];
  onCommit: () => void;
  onRescue?: () => void;
}

export function TaskBreakdownCard({ title, futureProjection, steps, onCommit, onRescue }: TaskProps) {
  return (
    <motion.div
      layoutId="task-wrapper"
      className="w-full bg-background/50 backdrop-blur-xl border border-primary-glow rounded-[2rem] p-8 md:p-12 shadow-[0_0_60px_var(--color-primary-glow)] relative overflow-hidden flex flex-col gap-10"
    >
      <motion.h2 layoutId="task-title" className="text-4xl md:text-5xl font-black text-foreground drop-shadow-[0_0_20px_var(--color-primary-glow)]">
        {title}
      </motion.h2>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-8"
      >
        {/* WOW Factor: Future Projection */}
        {futureProjection && (
          <div className="bg-primary-base/10 border border-primary-base/30 rounded-3xl p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary-base/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary-base/30 transition-colors duration-1000" />
            <h4 className="flex items-center gap-2 text-primary-base font-black text-sm tracking-widest uppercase mb-4 opacity-90">
              <Target size={20} /> Future Projection AI
            </h4>
            <p className="text-xl md:text-2xl font-serif leading-relaxed italic text-foreground/90 font-medium">
              "{futureProjection}"
            </p>
          </div>
        )}

        {/* Micro-Actions List */}
        <div className="space-y-5">
          <h4 className="font-black text-foreground/50 uppercase tracking-widest text-sm flex items-center gap-2">
            <Zap size={18} /> Day 1 Execution Plan
          </h4>
          <div className="grid gap-3">
            {steps.map((step, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-4 bg-foreground/5 p-5 rounded-2xl border border-foreground/5 hover:bg-foreground/10 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary-base/20 text-primary-base flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <span className="font-semibold text-lg text-foreground/90 pt-0.5">{step}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <button
          onClick={onCommit}
          className="w-full py-6 bg-foreground text-background text-2xl font-black tracking-wider rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_30px_var(--color-primary-glow)] flex items-center justify-center gap-3 mt-4"
        >
          START NOW
          <CheckCircle size={28} />
        </button>
      </motion.div>
    </motion.div>
  );
}
