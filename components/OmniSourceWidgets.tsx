"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Zap, Mail, MessageSquare, GraduationCap, Calendar, Bell, X, ChevronRight, Loader2 } from "lucide-react";

// ── Live Execution Stream ────────────────────────────────────────────────────

interface LogLine {
  id: number;
  time: string;
  text: string;
  type: "ai" | "task" | "schedule" | "warn" | "info";
}

const typeColors: Record<string, string> = {
  ai: "text-violet-400",
  task: "text-green-400",
  schedule: "text-blue-400",
  warn: "text-orange-400",
  info: "text-foreground/50",
};

const SEED_LINES: Omit<LogLine, "id">[] = [
  { time: "boot", text: "Second Brain OS initialized. Execution Engine online.", type: "ai" },
  { time: "boot", text: "Shadow Learner daemon activated.", type: "info" },
];

const AMBIENT_EVENTS: Omit<LogLine, "id" | "time">[] = [
  { text: "AI scanned Shadow Inbox: 0 new items pending triage.", type: "ai" },
  { text: "Friction Radar updated: baseline calibrated.", type: "info" },
  { text: "Peak energy window: 09:00 – 11:00. Schedule heavy tasks here.", type: "schedule" },
  { text: "Execution Score calculated. Keep the streak alive.", type: "ai" },
  { text: "No calendar conflicts detected for today.", type: "schedule" },
  { text: "Habit stack reminder: 3 unchecked habits this week.", type: "warn" },
];

function now() {
  return new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function useExecutionStream() {
  const [lines, setLines] = useState<LogLine[]>(() =>
    SEED_LINES.map((l, i) => ({ ...l, id: i, time: now() }))
  );
  const counterRef = useRef(100);

  const push = (text: string, type: LogLine["type"] = "info") => {
    counterRef.current += 1;
    setLines(prev => [...prev.slice(-50), { id: counterRef.current, time: now(), text, type }]);
  };

  // Ambient events every 20s
  useEffect(() => {
    let idx = 0;
    const id = setInterval(() => {
      const evt = AMBIENT_EVENTS[idx % AMBIENT_EVENTS.length];
      push(evt.text, evt.type);
      idx++;
    }, 20000);
    return () => clearInterval(id);
  }, []);

  return { lines, push };
}

export function LiveExecutionStream({ lines }: { lines: LogLine[] }) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  return (
    <div className="bg-black/60 border border-white/8 rounded-2xl overflow-hidden backdrop-blur-xl">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/8 bg-white/3">
        <Terminal size={14} className="text-green-400" />
        <span className="text-xs font-mono font-bold text-green-400 uppercase tracking-widest">Live Execution Stream</span>
        <div className="ml-auto flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
        </div>
      </div>
      <div className="h-36 overflow-y-auto p-4 space-y-1.5 scrollbar-hide font-mono text-xs">
        <AnimatePresence initial={false}>
          {lines.map(line => (
            <motion.div
              key={line.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-3"
            >
              <span className="text-foreground/25 shrink-0">[{line.time}]</span>
              <span className={typeColors[line.type]}>{line.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

// ── Friction Radar ────────────────────────────────────────────────────────────

interface FrictionRadarProps {
  resistance: number; // 0-100
  onAtomicBreakdown: () => void;
}

export function FrictionRadar({ resistance, onAtomicBreakdown }: FrictionRadarProps) {
  const r = Math.min(100, Math.max(0, resistance));
  const color = r < 33 ? "#22c55e" : r < 66 ? "#f59e0b" : "#ef4444";
  const label = r < 33 ? "Low" : r < 66 ? "Medium" : "High";
  const circumference = 2 * Math.PI * 28;

  return (
    <div
      className="flex flex-col items-center gap-2 bg-white/5 border border-white/10 rounded-2xl p-4 cursor-pointer hover:border-white/20 transition-all group"
      onClick={onAtomicBreakdown}
      title="Click to trigger Atomic Breakdown Mode"
    >
      <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Friction Radar</p>
      <div className="relative w-16 h-16">
        <svg viewBox="0 0 72 72" className="-rotate-90 w-full h-full">
          <circle cx="36" cy="36" r="28" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
          <circle
            cx="36" cy="36" r="28" fill="none"
            stroke={color} strokeWidth="6" strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - r / 100)}
            style={{ transition: "stroke-dashoffset 0.8s ease, stroke 0.5s" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-black text-sm" style={{ color }}>{r}%</span>
        </div>
      </div>
      <p className="text-xs font-bold" style={{ color }}>{label} Resistance</p>
      <p className="text-[10px] text-foreground/30 text-center group-hover:text-violet-400 transition-colors">
        Click → Atomic Mode
      </p>
    </div>
  );
}

// ── Shadow Learner Inbox ─────────────────────────────────────────────────────

interface InboxItem {
  id: string;
  source: "whatsapp" | "gmail" | "classroom";
  preview: string;
  detail: string;
  tag: string;
  pushed: boolean;
}

const MOCK_INBOX: InboxItem[] = [
  { id: "wa1", source: "whatsapp", preview: "Voice note from Group: 'Submit the assignment by 11 PM tonight'", detail: "Action: Submit assignment before 11 PM", tag: "Deadline", pushed: false },
  { id: "wa2", source: "whatsapp", preview: "Link shared: React reference docs for the project", detail: "Action: Save reference link", tag: "Resource", pushed: false },
  { id: "gm1", source: "gmail", preview: "Prof. Kumar: 'Meeting tomorrow at 4 PM — confirm attendance'", detail: "Action: Confirm meeting, check calendar conflict at 4 PM", tag: "Meeting", pushed: false },
  { id: "gm2", source: "gmail", preview: "Recruiter at Infosys: 'Submit your resume by Friday'", detail: "Action: Update and send resume to Infosys", tag: "Career", pushed: false },
  { id: "cl1", source: "classroom", preview: "New Coursework: 'OS Lab Assignment 3' — Due in 3 days", detail: "Action: Deep Work — complete OS Lab Assignment 3", tag: "Assignment", pushed: false },
  { id: "cl2", source: "classroom", preview: "Announcement: Unit test next Monday on Chapter 5", detail: "Action: Study Chapter 5 — schedule daily revision", tag: "Exam", pushed: false },
];

const SOURCE_CONFIG = {
  whatsapp: { icon: <MessageSquare size={14} />, label: "WhatsApp", color: "text-green-400 bg-green-500/10 border-green-500/20" },
  gmail: { icon: <Mail size={14} />, label: "Gmail", color: "text-red-400 bg-red-500/10 border-red-500/20" },
  classroom: { icon: <GraduationCap size={14} />, label: "Classroom", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
};

export function ShadowLearnerInbox({ onPushToBoard }: { onPushToBoard: (text: string) => void }) {
  const [activeTab, setActiveTab] = useState<"whatsapp" | "gmail" | "classroom">("whatsapp");
  const [items, setItems] = useState<InboxItem[]>(MOCK_INBOX);
  const [pushing, setPushing] = useState<string | null>(null);
  const [rawNote, setRawNote] = useState("");

  const visibleItems = items.filter(i => i.source === activeTab);

  const handlePush = async (item: InboxItem) => {
    setPushing(item.id);
    await new Promise(r => setTimeout(r, 800));
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, pushed: true } : i));
    onPushToBoard(item.detail);
    setPushing(null);
  };

  const handlePushRaw = async () => {
    if (!rawNote.trim()) return;
    setPushing("raw");
    await new Promise(r => setTimeout(r, 600));
    onPushToBoard(rawNote.trim());
    setRawNote("");
    setPushing(null);
  };

  return (
    <div className="bg-background/60 border border-foreground/10 rounded-3xl overflow-hidden backdrop-blur-xl">
      <div className="px-5 py-4 border-b border-foreground/10 flex items-center justify-between">
        <h3 className="font-black text-sm uppercase tracking-widest text-foreground/50 flex items-center gap-2">
          <Zap size={14} className="text-violet-400" /> Shadow Learner Inbox
        </h3>
        <span className="text-xs bg-violet-500/10 border border-violet-500/20 text-violet-400 px-2.5 py-1 rounded-full font-bold">
          {items.filter(i => !i.pushed).length} pending
        </span>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-foreground/8">
        {(["whatsapp", "gmail", "classroom"] as const).map(tab => {
          const cfg = SOURCE_CONFIG[tab];
          const count = items.filter(i => i.source === tab && !i.pushed).length;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
                activeTab === tab
                  ? "border-violet-500 text-foreground"
                  : "border-transparent text-foreground/40 hover:text-foreground/70"
              }`}
            >
              {cfg.icon}
              <span className="hidden sm:inline">{cfg.label}</span>
              {count > 0 && (
                <span className="w-4 h-4 rounded-full bg-violet-500 text-white text-[9px] flex items-center justify-center font-black">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Items */}
      <div className="p-4 space-y-3 max-h-72 overflow-y-auto scrollbar-hide">
        <AnimatePresence>
          {visibleItems.map(item => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: item.pushed ? 0.4 : 1, y: 0 }}
              className={`p-4 rounded-2xl border transition-all ${
                item.pushed
                  ? "border-foreground/5 bg-foreground/3"
                  : "border-foreground/10 bg-foreground/3 hover:border-foreground/20"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase border flex items-center gap-1 shrink-0 ${SOURCE_CONFIG[item.source].color}`}>
                  {item.tag}
                </div>
                <p className="text-sm text-foreground/80 leading-snug flex-1">{item.preview}</p>
              </div>
              {!item.pushed && (
                <button
                  onClick={() => handlePush(item)}
                  disabled={pushing === item.id}
                  className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 hover:bg-violet-500/20 transition-all text-xs font-bold uppercase tracking-widest"
                >
                  {pushing === item.id ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <>
                      Push to Dashboard <ChevronRight size={12} />
                    </>
                  )}
                </button>
              )}
              {item.pushed && (
                <p className="mt-2 text-xs text-green-400 font-bold flex items-center gap-1">
                  ✓ Added to execution board
                </p>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Raw note paste */}
        <div className="border-t border-foreground/8 pt-3 mt-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30 mb-2">Paste a raw note / voice transcript:</p>
          <div className="flex gap-2">
            <input
              value={rawNote}
              onChange={e => setRawNote(e.target.value)}
              placeholder="e.g. 'Call mentor about project by 5 PM'"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-foreground/25 focus:outline-none focus:border-violet-500/40 transition-all"
            />
            <button
              onClick={handlePushRaw}
              disabled={!rawNote.trim() || pushing === "raw"}
              className="px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-black hover:bg-violet-500 transition-colors disabled:opacity-40"
            >
              {pushing === "raw" ? <Loader2 size={14} className="animate-spin" /> : "→"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Notification Sentinel ─────────────────────────────────────────────────────

interface Notif {
  id: string;
  summary: string;
  count: number;
  acted: boolean;
}

const MOCK_NOTIFS: Notif[] = [
  { id: "n1", summary: "Assignment due tonight (11 PM), meeting rescheduled to 5 PM, and a reference link shared for your project.", count: 3, acted: false },
  { id: "n2", summary: "Professor posted Unit Test date for next Monday. Recruiter follow-up email received.", count: 2, acted: false },
];

export function NotificationSentinel() {
  const [notifs, setNotifs] = useState<Notif[]>(MOCK_NOTIFS);
  const [expanded, setExpanded] = useState<string | null>("n1");

  const act = (id: string) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, acted: true } : n));
  const pending = notifs.filter(n => !n.acted);

  return (
    <div className="bg-background/60 border border-foreground/10 rounded-3xl overflow-hidden backdrop-blur-xl">
      <div className="px-5 py-4 border-b border-foreground/10 flex items-center justify-between">
        <h3 className="font-black text-sm uppercase tracking-widest text-foreground/50 flex items-center gap-2">
          <Bell size={14} className="text-amber-400" /> Notification Sentinel
        </h3>
        {pending.length > 0 && (
          <span className="text-xs bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2.5 py-1 rounded-full font-bold">
            {pending.length} grouped
          </span>
        )}
      </div>
      <div className="p-4 space-y-3">
        {pending.length === 0 ? (
          <p className="text-center py-6 text-foreground/30 text-sm">All caught up. No pending notifications.</p>
        ) : (
          <AnimatePresence>
            {notifs.map(n => !n.acted && (
              <motion.div
                key={n.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-amber-500/5 border border-amber-500/15 rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setExpanded(expanded === n.id ? null : n.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left"
                >
                  <div className="w-7 h-7 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center shrink-0">
                    <span className="text-amber-400 font-black text-xs">{n.count}</span>
                  </div>
                  <p className="text-sm font-bold text-foreground/80 flex-1 line-clamp-1">
                    {n.count} Actionable Update{n.count > 1 ? "s" : ""}
                  </p>
                  <X
                    size={14}
                    className="text-foreground/30 hover:text-foreground/60 shrink-0"
                    onClick={e => { e.stopPropagation(); act(n.id); }}
                  />
                </button>
                <AnimatePresence>
                  {expanded === n.id && (
                    <motion.div
                      initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="px-4 pb-3 text-sm text-foreground/60 leading-relaxed border-t border-amber-500/10 pt-3">
                        "{n.summary}"
                      </p>
                      <div className="px-4 pb-4">
                        <button
                          onClick={() => act(n.id)}
                          className="text-xs font-black uppercase tracking-wider text-amber-400 hover:text-amber-300 transition-colors"
                        >
                          Mark as Acted →
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

// ── Smart Time-Blocking ───────────────────────────────────────────────────────

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

interface Block {
  day: number; // 0-6
  hour: number;
  label: string;
  type: "task" | "peak" | "scheduled";
}

export function SmartTimeBlocking({ tasks }: { tasks: any[] }) {
  const [blocks, setBlocks] = useState<Block[]>([
    { day: 0, hour: 9, label: "⚡ Peak Energy", type: "peak" },
    { day: 0, hour: 10, label: "⚡ Peak Energy", type: "peak" },
    { day: 2, hour: 9, label: "⚡ Peak Energy", type: "peak" },
    { day: 2, hour: 10, label: "⚡ Peak Energy", type: "peak" },
    { day: 4, hour: 9, label: "⚡ Peak Energy", type: "peak" },
  ]);
  const [scheduling, setScheduling] = useState(false);
  const today = new Date().getDay(); // 0=Sun, adjust to Mon=0
  const todayIdx = today === 0 ? 6 : today - 1;

  const handleAutoSchedule = async () => {
    setScheduling(true);
    await new Promise(r => setTimeout(r, 1200));
    // Place pending tasks into free slots
    const freeSlots: { day: number; hour: number }[] = [];
    for (let d = 0; d < 7; d++) {
      for (const h of [11, 14, 15, 16, 17]) {
        if (!blocks.find(b => b.day === d && b.hour === h)) {
          freeSlots.push({ day: d, hour: h });
        }
      }
    }
    const newBlocks: Block[] = tasks.slice(0, 3).map((t, i) => {
      const slot = freeSlots[i] || { day: i % 7, hour: 14 + i };
      return { day: slot.day, hour: slot.hour, label: t.title, type: "scheduled" as const };
    });
    setBlocks(prev => [...prev, ...newBlocks]);
    setScheduling(false);
  };

  const blockColors: Record<string, string> = {
    peak: "bg-violet-500/20 border-violet-500/40 text-violet-300",
    scheduled: "bg-blue-500/20 border-blue-500/40 text-blue-300",
    task: "bg-green-500/20 border-green-500/40 text-green-300",
  };

  return (
    <div className="bg-background/60 border border-foreground/10 rounded-3xl overflow-hidden backdrop-blur-xl">
      <div className="px-5 py-4 border-b border-foreground/10 flex items-center justify-between">
        <h3 className="font-black text-sm uppercase tracking-widest text-foreground/50 flex items-center gap-2">
          <Calendar size={14} className="text-blue-400" /> Smart Time-Blocking
        </h3>
        <button
          onClick={handleAutoSchedule}
          disabled={scheduling}
          className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
        >
          {scheduling ? <Loader2 size={12} className="animate-spin" /> : "⚡"}
          Auto-Schedule
        </button>
      </div>

      <div className="p-4 overflow-x-auto">
        <div className="min-w-[500px]">
          {/* Day headers */}
          <div className="grid grid-cols-8 gap-px mb-1">
            <div className="text-[10px] text-foreground/30 text-right pr-2 py-1">Time</div>
            {DAYS.map((d, i) => (
              <div key={d} className={`text-[10px] font-black uppercase text-center py-1 ${i === todayIdx ? "text-violet-400" : "text-foreground/30"}`}>
                {d}{i === todayIdx ? " ●" : ""}
              </div>
            ))}
          </div>

          {/* Hourly rows */}
          <div className="space-y-px">
            {HOURS.map(h => (
              <div key={h} className="grid grid-cols-8 gap-px">
                <div className="text-[10px] text-foreground/25 text-right pr-2 pt-1 shrink-0">
                  {h > 12 ? `${h - 12}PM` : h === 12 ? "12PM" : `${h}AM`}
                </div>
                {DAYS.map((_, d) => {
                  const block = blocks.find(b => b.day === d && b.hour === h);
                  return (
                    <div
                      key={d}
                      className={`h-8 rounded-md border text-[9px] flex items-center justify-center overflow-hidden cursor-default select-none transition-all ${
                        block
                          ? `${blockColors[block.type]} font-bold`
                          : "border-foreground/5 hover:bg-foreground/5"
                      }`}
                      title={block?.label}
                    >
                      {block && <span className="truncate px-1">{block.label.slice(0, 10)}</span>}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex gap-4 mt-3 text-[10px] text-foreground/40">
            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-violet-500/30 border border-violet-500/40" /> Peak Energy</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-blue-500/30 border border-blue-500/40" /> Scheduled</span>
          </div>
        </div>
      </div>
    </div>
  );
}
