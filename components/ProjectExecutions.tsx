"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ChevronDown, BarChart2, Flame } from "lucide-react";

interface Task {
  id: string;
  title: string;
  status: string;
  mode: string;
  createdAt: string;
}

interface Props {
  tasks: Task[];
}

// Mini Gantt Bar row
function GanttRow({ label, offset, width, color }: { label: string; offset: number; width: number; color: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-foreground/40 truncate w-20 shrink-0 text-right">{label}</span>
      <div className="flex-1 h-3 rounded bg-foreground/5 relative overflow-hidden">
        <motion.div
          initial={{ width: 0, x: `${offset}%` }}
          animate={{ width: `${width}%`, x: `${offset}%` }}
          transition={{ duration: 0.5 }}
          className={`absolute h-full rounded ${color}`}
        />
      </div>
    </div>
  );
}

// Contribution heatmap (last 35 cells)
function ContributionHeatmap({ tasks }: { tasks: Task[] }) {
  const today = new Date();
  const cells = Array.from({ length: 35 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (34 - i));
    const dateStr = d.toISOString().split("T")[0];
    const hasTask = tasks.some(t => t.createdAt?.startsWith(dateStr));
    const completed = tasks.some(t => t.createdAt?.startsWith(dateStr) && t.status === "COMPLETED");
    return { date: dateStr, hasTask, completed };
  });

  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30 flex items-center gap-1">
        <Flame size={10} /> Execution Heatmap
      </p>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, i) => (
          <div
            key={i}
            title={cell.date}
            className={`aspect-square rounded-sm transition-all ${
              cell.completed
                ? "bg-violet-500 shadow-[0_0_6px_rgba(139,92,246,0.5)]"
                : cell.hasTask
                ? "bg-violet-500/40"
                : "bg-foreground/8"
            }`}
          />
        ))}
      </div>
      <div className="flex items-center gap-2 text-[9px] text-foreground/30 mt-1">
        <div className="w-2 h-2 rounded-sm bg-foreground/8" /> None
        <div className="w-2 h-2 rounded-sm bg-violet-500/40" /> Attempted
        <div className="w-2 h-2 rounded-sm bg-violet-500" /> Completed
      </div>
    </div>
  );
}

// Group tasks by "project" (mock grouping by mode)
function groupTasks(tasks: Task[]) {
  const groups: Record<string, Task[]> = {};
  tasks.forEach(t => {
    const key = t.mode || "QUICK";
    if (!groups[key]) groups[key] = [];
    groups[key].push(t);
  });
  return groups;
}

const MODE_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  QUICK: { label: "Quick Wins", emoji: "⚡", color: "text-yellow-400" },
  DEEP: { label: "Deep Work Sessions", emoji: "🧠", color: "text-blue-400" },
  HABIT: { label: "Habit Stack", emoji: "🔁", color: "text-green-400" },
};

export function ProjectExecutions({ tasks }: Props) {
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["QUICK"]);
  const groups = groupTasks(tasks);

  const toggle = (key: string) =>
    setExpandedGroups(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );

  const hasAnyTask = tasks.length > 0;

  return (
    <div className="bg-background/60 border border-foreground/10 rounded-3xl overflow-hidden backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-foreground/10">
        <h3 className="font-black text-sm uppercase tracking-widest text-foreground/50 flex items-center gap-2">
          <BarChart2 size={14} /> My Project Executions
        </h3>
        <span className="text-xs font-bold text-foreground/40">{tasks.length} total</span>
      </div>

      <div className="p-5 flex flex-col gap-4">
        {!hasAnyTask ? (
          <div className="text-center py-10">
            <p className="text-5xl mb-3">🚀</p>
            <p className="font-bold text-foreground/50 text-sm">No executions yet.</p>
            <p className="text-foreground/30 text-xs mt-1">Enter an idea above to start your first mission.</p>
          </div>
        ) : (
          <>
            {/* Mini Gantt Chart */}
            <div className="bg-foreground/5 rounded-2xl p-4 flex flex-col gap-2 border border-foreground/8">
              <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30 mb-1 flex items-center gap-1">
                <BarChart2 size={10} /> Timeline View
              </p>
              <GanttRow label="Quick" offset={0} width={70} color="bg-yellow-500/60" />
              <GanttRow label="Deep Work" offset={15} width={50} color="bg-blue-500/60" />
              <GanttRow label="Habit" offset={30} width={85} color="bg-green-500/60" />
            </div>

            {/* Contribution heatmap */}
            <div className="bg-foreground/5 rounded-2xl p-4 border border-foreground/8">
              <ContributionHeatmap tasks={tasks} />
            </div>

            {/* Task groups */}
            <div className="flex flex-col gap-2">
              {Object.entries(groups).map(([mode, modeTasks]) => {
                const cfg = MODE_LABELS[mode] || { label: mode, emoji: "📌", color: "text-foreground/60" };
                const done = modeTasks.filter(t => t.status === "COMPLETED").length;
                const isOpen = expandedGroups.includes(mode);

                return (
                  <div key={mode} className="border border-foreground/10 rounded-2xl overflow-hidden">
                    <button
                      onClick={() => toggle(mode)}
                      className="w-full flex items-center gap-3 px-5 py-4 hover:bg-foreground/5 transition-colors text-left"
                    >
                      <span className="text-lg">{cfg.emoji}</span>
                      <div className="flex-1">
                        <p className={`font-bold text-sm ${cfg.color}`}>{cfg.label}</p>
                        <p className="text-xs text-foreground/40">{done}/{modeTasks.length} completed</p>
                      </div>
                      {/* Mini progress */}
                      <div className="w-16 h-1.5 bg-foreground/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-violet-500 rounded-full transition-all"
                          style={{ width: `${modeTasks.length ? (done / modeTasks.length) * 100 : 0}%` }}
                        />
                      </div>
                      <ChevronDown
                        size={16}
                        className={`text-foreground/30 transition-transform ${isOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden border-t border-foreground/8"
                        >
                          <div className="p-3 space-y-2">
                            {modeTasks.map(task => (
                              <div
                                key={task.id}
                                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                                  task.status === "COMPLETED"
                                    ? "border-violet-500/20 bg-violet-500/5 text-foreground/40"
                                    : "border-foreground/8 bg-background hover:bg-foreground/5"
                                }`}
                              >
                                {task.status === "COMPLETED" ? (
                                  <CheckCircle2 size={16} className="text-violet-400 shrink-0" />
                                ) : (
                                  <div className="w-4 h-4 rounded-full border border-foreground/30 shrink-0" />
                                )}
                                <span className="text-sm font-medium flex-1 truncate">{task.title}</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
