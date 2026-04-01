"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, CheckCircle2, AlertTriangle, Coffee, Zap, Calendar, FileText, ChevronRight } from "lucide-react";

function formatDuration(seconds: number | null | undefined) {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}

function formatDate(d: string | Date | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  TODO: { label: "To Do", color: "text-foreground/50 bg-foreground/10 border-foreground/15", icon: <Clock size={12} /> },
  IN_PROGRESS: { label: "In Progress", color: "text-blue-400 bg-blue-500/10 border-blue-500/25", icon: <Zap size={12} /> },
  COMPLETED: { label: "Completed", color: "text-green-400 bg-green-500/10 border-green-500/25", icon: <CheckCircle2 size={12} /> },
  FAILED: { label: "Failed", color: "text-red-400 bg-red-500/10 border-red-500/25", icon: <AlertTriangle size={12} /> },
  ON_BREAK: { label: "On Break", color: "text-amber-400 bg-amber-500/10 border-amber-500/25", icon: <Coffee size={12} /> },
};

const MODE_CONFIG: Record<string, { label: string; color: string }> = {
  QUICK: { label: "⚡ Quick Execution", color: "text-yellow-400" },
  DEEP: { label: "🧠 Deep Work", color: "text-blue-400" },
  HABIT: { label: "🔁 Habit Builder", color: "text-green-400" },
};

interface Task {
  id: string;
  title: string;
  status: string;
  mode: string;
  complexity: number;
  futureProjection: string | null;
  allocatedMinutes: number | null;
  actualSeconds: number | null;
  breakSeconds: number;
  notes: string | null;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  subTasks: { id: string; title: string; status: string }[];
  user: { name: string | null; email: string } | null;
}

interface Props {
  taskId: string | null;
  onClose: () => void;
}

export function TaskDetailModal({ taskId, onClose }: Props) {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!taskId) { setTask(null); return; }
    setLoading(true);
    fetch(`/api/tasks/${taskId}`)
      .then(r => r.json())
      .then(d => { setTask(d.task); setLoading(false); })
      .catch(() => setLoading(false));
  }, [taskId]);

  if (!taskId) return null;

  const efficiency = task?.allocatedMinutes && task?.actualSeconds
    ? Math.min(100, Math.round((task.allocatedMinutes * 60 / Math.max(1, task.actualSeconds)) * 100))
    : null;

  return (
    <AnimatePresence>
      {taskId && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 h-full z-50 w-full max-w-lg bg-[#09090f] border-l border-white/10 shadow-[−20px_0_80px_rgba(0,0,0,0.6)] overflow-y-auto scrollbar-hide"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 border-b border-white/8 bg-[#09090f]/90 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-violet-400" />
                <span className="font-black text-sm uppercase tracking-widest text-foreground/60">Task Details</span>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/8 text-foreground/40 hover:text-foreground transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-6">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-10 h-10 rounded-full border-t-2 border-violet-500 animate-spin" />
                </div>
              ) : !task ? (
                <p className="text-center text-foreground/40 py-20">Task not found.</p>
              ) : (
                <>
                  {/* Title + Status */}
                  <div className="flex flex-col gap-3">
                    <h2 className="text-2xl font-black leading-snug">{task.title}</h2>
                    <div className="flex flex-wrap gap-2">
                      {(() => {
                        const sc = STATUS_CONFIG[task.status] || STATUS_CONFIG.TODO;
                        return (
                          <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-black uppercase tracking-wider ${sc.color}`}>
                            {sc.icon} {sc.label}
                          </span>
                        );
                      })()}
                      <span className={`text-xs font-black px-3 py-1.5 rounded-xl bg-foreground/8 border border-foreground/10 ${MODE_CONFIG[task.mode]?.color || ""}`}>
                        {MODE_CONFIG[task.mode]?.label || task.mode}
                      </span>
                    </div>
                  </div>

                  {/* Time Analytics */}
                  <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
                    <p className="text-xs font-black uppercase tracking-widest text-foreground/40 mb-4 flex items-center gap-2">
                      <Clock size={12} /> Time Analytics
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Allocated", value: task.allocatedMinutes ? `${task.allocatedMinutes}m` : "—", color: "text-foreground" },
                        { label: "Actual Time", value: formatDuration(task.actualSeconds), color: "text-green-400" },
                        { label: "Break Time", value: formatDuration(task.breakSeconds), color: "text-amber-400" },
                        { label: "Efficiency", value: efficiency !== null ? `${efficiency}%` : "—", color: efficiency !== null && efficiency >= 80 ? "text-green-400" : "text-orange-400" },
                      ].map(item => (
                        <div key={item.label} className="bg-white/3 rounded-2xl p-4">
                          <p className="text-foreground/40 text-xs uppercase tracking-wider mb-1">{item.label}</p>
                          <p className={`font-black text-2xl ${item.color}`}>{item.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Efficiency bar */}
                    {efficiency !== null && (
                      <div className="mt-4">
                        <div className="flex justify-between text-xs text-foreground/40 mb-1.5">
                          <span>Time Efficiency</span>
                          <span className={efficiency >= 80 ? "text-green-400" : "text-orange-400"}>{efficiency}%</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${efficiency}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className={`h-full rounded-full ${efficiency >= 80 ? "bg-green-500" : efficiency >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Timeline */}
                  <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
                    <p className="text-xs font-black uppercase tracking-widest text-foreground/40 mb-4 flex items-center gap-2">
                      <Calendar size={12} /> Timeline
                    </p>
                    <div className="space-y-3">
                      {[
                        { label: "Created", value: formatDate(task.createdAt), dot: "bg-foreground/40" },
                        { label: "Started", value: formatDate(task.startedAt), dot: "bg-blue-400" },
                        { label: "Completed", value: formatDate(task.completedAt), dot: task.status === "COMPLETED" ? "bg-green-400" : task.status === "FAILED" ? "bg-red-400" : "bg-foreground/20" },
                      ].map(row => (
                        <div key={row.label} className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${row.dot} shrink-0`} />
                          <span className="text-foreground/40 text-xs w-20 shrink-0">{row.label}</span>
                          <span className="text-sm font-semibold">{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Future Projection */}
                  {task.futureProjection && (
                    <div className="bg-violet-500/8 border border-violet-500/20 rounded-2xl p-5">
                      <p className="text-xs font-black uppercase tracking-widest text-violet-400 mb-3">🔮 Original Future Projection</p>
                      <p className="text-foreground/70 text-sm italic leading-relaxed">"{task.futureProjection}"</p>
                    </div>
                  )}

                  {/* Subtasks */}
                  {task.subTasks && task.subTasks.length > 0 && (
                    <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
                      <p className="text-xs font-black uppercase tracking-widest text-foreground/40 mb-4 flex items-center gap-2">
                        <ChevronRight size={12} /> Execution Steps ({task.subTasks.filter(s => s.status === "COMPLETED").length}/{task.subTasks.length})
                      </p>
                      <div className="space-y-2">
                        {task.subTasks.map((sub, i) => (
                          <div
                            key={sub.id}
                            className={`flex items-center gap-3 p-3 rounded-xl border text-sm ${
                              sub.status === "COMPLETED"
                                ? "bg-green-500/5 border-green-500/15 text-foreground/50"
                                : "border-foreground/8 text-foreground/80"
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-black ${sub.status === "COMPLETED" ? "bg-green-500 text-white" : "bg-foreground/10 text-foreground/50"}`}>
                              {sub.status === "COMPLETED" ? "✓" : i + 1}
                            </div>
                            <span className={sub.status === "COMPLETED" ? "line-through" : ""}>{sub.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {task.notes && (
                    <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
                      <p className="text-xs font-black uppercase tracking-widest text-foreground/40 mb-3">Notes</p>
                      <p className="text-sm text-foreground/70 leading-relaxed">{task.notes}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
