"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Zap, Clock, Brain } from "lucide-react";

interface Skill {
  label: string;
  value: number; // 0-100
}

interface Props {
  idea: string | null;
  priority?: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  estimatedDays?: number;
  skills?: Skill[];
  mode?: string;
}

const PRIORITY_CONFIG = {
  CRITICAL: { color: "text-red-400", bg: "bg-red-500/10 border-red-500/30", ring: "rgba(239,68,68,0.5)", label: "🔴 Critical" },
  HIGH: { color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/30", ring: "rgba(249,115,22,0.5)", label: "🟠 High" },
  MEDIUM: { color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30", ring: "rgba(234,179,8,0.4)", label: "🟡 Medium" },
  LOW: { color: "text-green-400", bg: "bg-green-500/10 border-green-500/30", ring: "rgba(34,197,94,0.4)", label: "🟢 Low" },
};

const MODE_CONFIG: Record<string, { label: string; color: string }> = {
  QUICK: { label: "⚡ Quick Execution", color: "text-yellow-400" },
  DEEP: { label: "🧠 Deep Work", color: "text-blue-400" },
  HABIT: { label: "🔁 Habit Builder", color: "text-green-400" },
};

// SVG Hexagon Radar Chart
function HexagonRadar({ skills }: { skills: Skill[] }) {
  const cx = 80, cy = 80, r = 60;
  const n = skills.length;

  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const pt = (i: number, radius: number) => ({
    x: cx + radius * Math.cos(angle(i)),
    y: cy + radius * Math.sin(angle(i)),
  });

  const toPath = (points: { x: number; y: number }[]) =>
    points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ") + " Z";

  // Concentric grid polygons at 25%, 50%, 75%, 100%
  const gridLevels = [0.25, 0.5, 0.75, 1];

  // Normalize skill values
  const dataPoints = skills.map((s, i) => pt(i, r * (s.value / 100)));

  return (
    <svg viewBox="0 0 160 160" className="w-full h-full">
      <defs>
        <radialGradient id="radarGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(139,92,246,0.3)" />
          <stop offset="100%" stopColor="rgba(139,92,246,0.0)" />
        </radialGradient>
      </defs>

      {/* Grid rings */}
      {gridLevels.map((lvl, gi) => {
        const pts = skills.map((_, i) => pt(i, r * lvl));
        return (
          <path
            key={gi}
            d={toPath(pts)}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.1}
            strokeWidth={0.8}
            className="text-foreground"
          />
        );
      })}

      {/* Axis spokes */}
      {skills.map((_, i) => {
        const outer = pt(i, r);
        return (
          <line
            key={i}
            x1={cx} y1={cy}
            x2={outer.x} y2={outer.y}
            stroke="currentColor"
            strokeOpacity={0.15}
            strokeWidth={0.8}
            className="text-foreground"
          />
        );
      })}

      {/* Data polygon */}
      <path
        d={toPath(dataPoints)}
        fill="url(#radarGrad)"
        stroke="rgba(139,92,246,0.8)"
        strokeWidth={1.5}
      />

      {/* Data points */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill="rgba(139,92,246,1)" />
      ))}

      {/* Labels */}
      {skills.map((s, i) => {
        const labelPt = pt(i, r + 14);
        return (
          <text
            key={i}
            x={labelPt.x}
            y={labelPt.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={7}
            fill="currentColor"
            fillOpacity={0.6}
            className="text-foreground font-medium"
          >
            {s.label}
          </text>
        );
      })}
    </svg>
  );
}

export function MissionContextCenter({ idea, priority = "HIGH", estimatedDays = 7, skills, mode = "QUICK" }: Props) {
  const cfg = PRIORITY_CONFIG[priority];
  const modeCfg = MODE_CONFIG[mode] || MODE_CONFIG.QUICK;

  const defaultSkills: Skill[] = [
    { label: "Focus", value: 72 },
    { label: "Consistency", value: 58 },
    { label: "Speed", value: 85 },
    { label: "Creativity", value: 63 },
    { label: "Discipline", value: 49 },
    { label: "Clarity", value: 70 },
  ];

  const displaySkills = skills || defaultSkills;

  return (
    <div className="bg-background/60 border border-foreground/10 rounded-3xl p-6 backdrop-blur-xl flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h3 className="font-black text-sm uppercase tracking-widest text-foreground/50 flex items-center gap-2">
          <Brain size={14} /> Mission Context
        </h3>
        <span className={`text-xs font-black px-3 py-1.5 rounded-xl border ${cfg.bg} ${cfg.color}`}>
          {cfg.label}
        </span>
      </div>

      {idea && (
        <div className="bg-foreground/5 rounded-2xl p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-foreground/40 mb-1">Active Mission</p>
          <p className="font-bold text-foreground leading-snug line-clamp-2">{idea}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-foreground/5 rounded-2xl p-4 flex flex-col gap-1">
          <div className="flex items-center gap-2 text-foreground/40">
            <Clock size={13} />
            <span className="text-xs font-bold uppercase tracking-wider">Timeline</span>
          </div>
          <p className="font-black text-xl">{estimatedDays}<span className="text-sm font-normal text-foreground/50 ml-1">days</span></p>
        </div>
        <div className="bg-foreground/5 rounded-2xl p-4 flex flex-col gap-1">
          <div className="flex items-center gap-2 text-foreground/40">
            <Zap size={13} />
            <span className="text-xs font-bold uppercase tracking-wider">Mode</span>
          </div>
          <p className={`font-black text-sm ${modeCfg.color}`}>{modeCfg.label}</p>
        </div>
      </div>

      {/* Skill Radar */}
      <div className="flex flex-col gap-3">
        <p className="text-xs font-black uppercase tracking-widest text-foreground/40 flex items-center gap-2">
          <AlertTriangle size={12} /> Skill Profile
        </p>
        <div className="w-full aspect-square max-w-[180px] mx-auto">
          <HexagonRadar skills={displaySkills} />
        </div>

        {/* Skill bars below radar */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-1">
          {displaySkills.slice(0, 4).map((skill, i) => (
            <div key={i} className="flex flex-col gap-1">
              <div className="flex justify-between text-[10px] text-foreground/50 font-semibold">
                <span>{skill.label}</span>
                <span>{skill.value}%</span>
              </div>
              <div className="h-1 bg-foreground/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${skill.value}%` }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  className="h-full bg-violet-500 rounded-full"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
