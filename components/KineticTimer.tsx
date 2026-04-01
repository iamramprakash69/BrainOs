"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export function KineticTimer({ 
  durationMinutes = 25, 
  onComplete 
}: { 
  durationMinutes?: number;
  onComplete: () => void;
}) {
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!isActive || timeLeft <= 0) return;

    const intervalId = setInterval(() => {
      setTimeLeft((time) => {
        if (time <= 1) {
          clearInterval(intervalId);
          onComplete();
          return 0;
        }
        return time - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isActive, timeLeft, onComplete]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  // Scale increases smoothly as time goes down. Starts at 1, ends at 1.5
  const progress = 1 - (timeLeft / (durationMinutes * 60));
  const scale = 1 + (progress * 0.5);
  
  // Pulse animation intensity increases in the last 60 seconds
  const isUrgent = timeLeft < 60;

  return (
    <motion.div 
      animate={{ scale }}
      transition={{ type: "tween", ease: "linear", duration: 1 }}
      className={`font-mono font-bold text-center drop-shadow-[0_0_30px_var(--color-primary-glow)] ${isUrgent ? 'animate-blitz-pulse text-primary-base' : 'text-foreground'}`}
      style={{ fontSize: "clamp(4rem, 15vw, 12rem)", lineHeight: 1 }}
    >
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </motion.div>
  );
}
