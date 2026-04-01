"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AntiGravityInput } from "@/components/AntiGravityInput";
import { TaskBreakdownCard } from "@/components/TaskBreakdownCard";
import { AIStrategistFeed } from "@/components/AIStrategistFeed";
import { MissionContextCenter } from "@/components/MissionContextCenter";
import { ProjectExecutions } from "@/components/ProjectExecutions";
import { TaskDetailModal } from "@/components/TaskDetailModal";
import {
  LiveExecutionStream, FrictionRadar, ShadowLearnerInbox,
  NotificationSentinel, SmartTimeBlocking, useExecutionStream,
} from "@/components/OmniSourceWidgets";
import {
  Flame, Target, CheckCircle2, Rocket, TrendingUp,
  Zap, ShieldCheck, Skull, Brain, Layout,
} from "lucide-react";
import Link from "next/link";

function Counter({ value }: { value: number }) {
  const [cur, setCur] = useState(0);
  useEffect(() => {
    let s = 0;
    const step = value / 40;
    const t = setInterval(() => {
      s += step;
      if (s >= value) { setCur(value); clearInterval(t); } else setCur(Math.floor(s));
    }, 20);
    return () => clearInterval(t);
  }, [value]);
  return <>{cur}</>;
}

export default function Home() {
  const [taskIdea, setTaskIdea] = useState<string | null>(null);
  const [isBreakingDown, setIsBreakingDown] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"dashboard" | "omni" | "calendar">("dashboard");
  const [frictionResistance, setFrictionResistance] = useState(35);

  const { lines, push } = useExecutionStream();

  const [user] = useState<any>({ name: "You" });
  useEffect(() => {
    fetch("/api/user")
      .then(r => r.json())
      .then(data => {
        setUserData(data.user);
        const t = data.tasks || [];
        setTasks(t);
        const done = new Set<string>(t.filter((x: any) => x.status === "COMPLETED").map((x: any) => x.id));
        setCheckedItems(done);
      });
  }, []);

  const handleIdeaSubmit = async (idea: string) => {
    setTaskIdea(idea);
    setIsBreakingDown(true);
    push(`AI processing idea: "${idea}"`, "ai");

    const breakRes = await fetch("/api/breakdown", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idea }),
    });
    const breakdown = await breakRes.json();
    push(`AI generated ${breakdown.steps?.length || 0} execution steps`, "task");

    const dbRes = await fetch("/api/tasks/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idea, ...breakdown }),
    });
    const { task } = await dbRes.json();
    push(`Task created and saved to dashboard`, "task");

    setAiResult({ ...breakdown, id: task?.id });
    setFrictionResistance(Math.min(85, frictionResistance + 15));
    setIsBreakingDown(false);
  };

  const handleCommit = () => {
    if (!aiResult) return;
    push(`Entering Tunnel for: "${taskIdea}"`, "task");
    window.location.href = `/tunnel?id=${aiResult.id}&title=${encodeURIComponent(taskIdea!)}`;
  };

  const handleAtomicBreakdown = () => {
    push("Atomic Breakdown Mode triggered — switching to 2-min task", "warn");
    if (!aiResult) return;
    window.location.href = `/tunnel?id=${aiResult.id}&title=${encodeURIComponent(taskIdea ?? "Task")}&rescue=1`;
  };



  const completedCount = tasks.filter(t => t.status === "COMPLETED").length;
  const completionPct = tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);
  const score = userData?.executionScore ?? user?.executionScore ?? 0;
  const streak = userData?.currentStreak ?? user?.currentStreak ?? 0;

  // Task breakdown view
  if (taskIdea) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-start p-6 md:p-12 bg-background relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.1),transparent_60%)]" />
        <div className="w-full max-w-4xl z-10 pt-4">
          <button
            onClick={() => { setTaskIdea(null); setAiResult(null); }}
            className="mb-8 text-sm text-foreground/40 hover:text-foreground transition-colors flex items-center gap-2 uppercase tracking-wider font-bold"
          >
            ← Dashboard
          </button>
          <AnimatePresence>
            {isBreakingDown ? (
              <motion.div key="loading" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-6 pt-20">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 rounded-full border-2 border-violet-500/30 animate-ping" />
                  <div className="absolute inset-2 rounded-full border-t-2 border-r-2 border-violet-500 animate-spin" />
                  <Brain size={28} className="absolute inset-0 m-auto text-violet-400" />
                </div>
                <p className="text-foreground/60 tracking-widest uppercase font-bold text-sm">AI structuring your execution plan...</p>
              </motion.div>
            ) : aiResult && (
              <motion.div key="result" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex gap-4 mb-6 items-center flex-wrap">
                  <FrictionRadar resistance={frictionResistance} onAtomicBreakdown={handleAtomicBreakdown} />
                  <p className="text-foreground/40 text-xs max-w-xs">
                    Mental resistance score for this task. High? Click the radar to switch to Atomic Breakdown Mode.
                  </p>
                </div>
                <TaskBreakdownCard
                  title={taskIdea}
                  futureProjection={aiResult.futureProjection}
                  steps={aiResult.steps || []}
                  onCommit={handleCommit}
                  onRescue={handleAtomicBreakdown}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground relative overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-violet-600/6 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px]" />
      </div>
      <TaskDetailModal taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} />

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 md:px-8 py-6 flex flex-col gap-6">

        {/* ── Header ── */}
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-3">
              <span className="w-8 h-8 bg-gradient-to-br from-violet-500 to-blue-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.4)]">
                <Zap size={16} className="text-white" />
              </span>
              Second Brain OS
            </h1>
            <p className="text-foreground/40 text-xs uppercase tracking-widest ml-11">Execution Engine · v2.0</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-foreground/5 border border-foreground/10 shadow-[0_0_20px_rgba(139,92,246,0.1)]">
              <Target size={16} className="text-violet-400" />
              <span className="font-black text-sm"><Counter value={score} /><span className="text-foreground/40 font-normal">/100</span></span>
              <span className="text-xs text-foreground/40 uppercase tracking-wider ml-1">Score</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-orange-500/8 border border-orange-500/20">
              <Flame size={16} className="text-orange-400" />
              <span className="font-black text-sm text-orange-400"><Counter value={streak} /></span>
              <span className="text-xs text-orange-400/60 uppercase tracking-wider">Streak</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-foreground/5 border border-foreground/10">
              <ShieldCheck size={16} className="text-green-400" />
              <span className="font-black text-sm">{completedCount}</span>
              <span className="text-xs text-foreground/40 uppercase tracking-wider">Done</span>
            </div>
            <Link href="/shame" className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-red-500/8 border border-red-500/20 text-red-400 hover:bg-red-500/15 transition-all">
              <Skull size={16} />
              <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">Shame</span>
            </Link>
          </div>
        </header>

        {/* ── Tabs ── */}
        <div className="flex gap-1 bg-foreground/5 rounded-2xl p-1 w-fit self-start border border-foreground/8">
          {[
            { key: "dashboard", label: "Dashboard", icon: <Layout size={14} /> },
            { key: "omni", label: "Omni-Source", icon: <Zap size={14} /> },
            { key: "calendar", label: "Time-Blocks", icon: <Target size={14} /> },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.key
                  ? "bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                  : "text-foreground/40 hover:text-foreground"
              }`}
            >
              {tab.icon} <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ── Dashboard Tab ── */}
        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-6 items-start">
            {/* LEFT: AI Strategist */}
            <div className="hidden lg:flex flex-col" style={{ minHeight: 680 }}>
              <AIStrategistFeed activeIdea={taskIdea} />
            </div>

            {/* CENTER */}
            <div className="flex flex-col gap-6">
              {/* Hero Input */}
              <div className="bg-background/60 border border-foreground/10 rounded-3xl p-8 md:p-10 backdrop-blur-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(139,92,246,0.08),transparent_60%)] pointer-events-none" />
                <div className="relative z-10 flex flex-col items-center gap-6 text-center">
                  <div className="space-y-2">
                    <h2 className="text-3xl md:text-4xl font-black leading-tight">
                      Stop collecting ideas.<br />
                      <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
                        Start executing them.
                      </span>
                    </h2>
                    <p className="text-foreground/40 text-sm max-w-md mx-auto">
                      This system adapts, pushes, and forces action.
                    </p>
                  </div>
                  <AntiGravityInput onIdeaSubmit={handleIdeaSubmit} />
                  <motion.button
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      const inp = document.querySelector<HTMLInputElement>("[data-anti-gravity-input]");
                      if (inp?.value) handleIdeaSubmit(inp.value); else inp?.focus();
                    }}
                    className="group relative overflow-hidden flex items-center gap-3 px-8 py-4 bg-gradient-to-br from-violet-600 to-blue-600 text-white font-black rounded-2xl shadow-[0_0_40px_rgba(139,92,246,0.4)] hover:shadow-[0_0_60px_rgba(139,92,246,0.6)] transition-all uppercase tracking-wider text-sm"
                  >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Rocket size={20} className="group-hover:animate-bounce" />
                    Initiate Execution Sequence
                    <TrendingUp size={16} className="opacity-60" />
                  </motion.button>
                </div>
              </div>

              {/* Today's Checklist */}
              <div className="bg-background/60 border border-foreground/10 rounded-3xl p-6 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-black text-sm uppercase tracking-widest text-foreground/50 flex items-center gap-2">
                    <CheckCircle2 size={14} /> Today's Execution Checklist
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-violet-400 font-black text-sm">{completionPct}%</span>
                    <span className="text-foreground/30 text-xs">complete</span>
                  </div>
                </div>
                <div className="w-full h-2.5 bg-foreground/8 rounded-full overflow-hidden mb-5">
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${completionPct}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500 shadow-[0_0_12px_rgba(139,92,246,0.5)]"
                  />
                </div>
                {tasks.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-4xl mb-2">🎯</p>
                    <p className="text-foreground/40 text-sm font-semibold">No missions yet today.</p>
                    <p className="text-foreground/25 text-xs mt-1">Enter an idea above to create your first plan.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {tasks.slice(0, 5).map((task, idx) => {
                      const isChecked = checkedItems.has(task.id);
                      return (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.07 }}
                          className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all select-none ${
                            isChecked ? "bg-violet-500/8 border-violet-500/20" : "border-foreground/8 hover:border-foreground/20 hover:bg-foreground/5"
                          }`}
                        >
                          <div
                            onClick={() => setCheckedItems(prev => { const n = new Set(prev); n.has(task.id) ? n.delete(task.id) : n.add(task.id); return n; })}
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 cursor-pointer transition-all ${
                              isChecked ? "bg-violet-500 border-violet-500" : "border-foreground/30"
                            }`}
                          >
                            {isChecked && <CheckCircle2 size={12} className="text-white" />}
                          </div>
                          <span className={`font-semibold text-sm flex-1 truncate transition-all ${isChecked ? "line-through text-foreground/35" : "text-foreground/80"}`}>{task.title}</span>
                          {/* Detail button */}
                          <button
                            onClick={() => setSelectedTaskId(task.id)}
                            className="opacity-0 group-hover:opacity-100 text-foreground/30 hover:text-violet-400 transition-all text-xs font-bold uppercase tracking-wider px-2"
                          >
                            Details
                          </button>
                          <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest ${
                            task.mode === "QUICK" ? "bg-yellow-500/10 text-yellow-400" :
                            task.mode === "DEEP" ? "bg-blue-500/10 text-blue-400" :
                            "bg-green-500/10 text-green-400"
                          }`}>{task.mode}</span>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Project Executions */}
              <ProjectExecutions tasks={tasks} />

              {/* Live Execution Stream */}
              <LiveExecutionStream lines={lines} />
            </div>

            {/* RIGHT */}
            <div className="hidden lg:flex flex-col gap-6">
              <MissionContextCenter idea={taskIdea} priority="HIGH" estimatedDays={7} mode="QUICK" />
              <NotificationSentinel />
            </div>
          </div>
        )}

        {/* ── Omni-Source Tab ── */}
        {activeTab === "omni" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 text-sm text-amber-400/80 font-semibold mb-6 flex flex-col gap-1.5">
                <span className="font-black uppercase tracking-widest text-xs">⚠️ Integration Status</span>
                <span>WhatsApp & Gmail integrations are in <strong>Simulation Mode</strong>. To activate full integrations: WhatsApp requires a Meta Business account; Gmail requires a Google Cloud OAuth project. Use "Push to Dashboard" to convert any item into a real execution task now.</span>
              </div>
            </div>
            <div className="md:col-span-2">
              <ShadowLearnerInbox onPushToBoard={(text) => {
                push(`Shadow Learner → Pushing to dashboard: "${text.slice(0, 60)}..."`, "ai");
                handleIdeaSubmit(text);
              }} />
            </div>
            <NotificationSentinel />
            <div className="flex flex-col gap-6">
              <LiveExecutionStream lines={lines} />
            </div>
          </div>
        )}

        {/* ── Calendar Tab ── */}
        {activeTab === "calendar" && (
          <div className="flex flex-col gap-6">
            <SmartTimeBlocking tasks={tasks} />
            <div className="bg-blue-500/5 border border-blue-500/15 rounded-2xl p-4 text-sm text-blue-400/70">
              <span className="font-black uppercase tracking-widest text-xs block mb-1">📅 Google Calendar Integration</span>
              To connect your real Google Calendar, you'll need a Google Cloud Project with Calendar API enabled. The auto-schedule logic above is simulated — once connected, it will read your real free slots.
            </div>
          </div>
        )}

        {/* Mobile: Omni widgets stacked */}
        <div className="lg:hidden flex flex-col gap-6">
          <AIStrategistFeed activeIdea={taskIdea} />
          <MissionContextCenter idea={taskIdea} priority="HIGH" estimatedDays={7} mode="QUICK" />
        </div>

      </div>
    </main>
  );
}
