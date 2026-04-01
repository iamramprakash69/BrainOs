"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Skull, Flame, Trash2, ArrowLeft, RefreshCw, Clock } from "lucide-react";
import Link from "next/link";

interface ShameEntry {
  id: string;
  taskTitle: string;
  reason: string;
  createdAt: string;
  user: { name: string | null; email: string };
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function WallOfShamePage() {
  const [entries, setEntries] = useState<ShameEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const user = JSON.parse(localStorage.getItem("sb_user") || "{}");
    const qs = user?.id ? `?userId=${user.id}` : "";
    const res = await fetch(`/api/shame${qs}`);
    const data = await res.json();
    setEntries(data.entries || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    setRemoving(id);
    await fetch("/api/shame", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await new Promise(r => setTimeout(r, 400));
    setEntries(prev => prev.filter(e => e.id !== id));
    setRemoving(null);
  };

  return (
    <main className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* BG glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-red-800/8 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <Link
            href="/"
            className="flex items-center gap-2 text-foreground/40 hover:text-foreground transition-colors text-sm font-bold uppercase tracking-wider"
          >
            <ArrowLeft size={16} /> Dashboard
          </Link>
          <button
            onClick={load}
            className="p-2 rounded-lg hover:bg-white/5 text-foreground/40 hover:text-foreground transition-all"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Title block */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-red-500/10 border border-red-500/30 rounded-3xl mb-5 shadow-[0_0_40px_rgba(239,68,68,0.2)]"
          >
            <Skull size={38} className="text-red-400" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black mb-3">Wall of Shame</h1>
          <p className="text-foreground/40 text-base max-w-md mx-auto">
            These commitments were broken. Every entry is a lesson. Redeem yourself.
          </p>
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="h-px bg-red-500/20 flex-1" />
            <Flame size={16} className="text-red-500/40" />
            <div className="h-px bg-red-500/20 flex-1" />
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: "Broken Contracts", value: entries.length, color: "text-red-400" },
            { label: "This Week", value: entries.filter(e => Date.now() - new Date(e.createdAt).getTime() < 604800000).length, color: "text-orange-400" },
            { label: "Today", value: entries.filter(e => Date.now() - new Date(e.createdAt).getTime() < 86400000).length, color: "text-yellow-400" },
          ].map(stat => (
            <div key={stat.label} className="bg-red-500/5 border border-red-500/15 rounded-2xl p-4 text-center">
              <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
              <p className="text-foreground/40 text-xs uppercase tracking-wider mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="flex flex-col items-center gap-4 py-20">
            <div className="w-10 h-10 rounded-full border-t-2 border-red-500 animate-spin" />
            <p className="text-foreground/40 text-sm uppercase tracking-wider">Loading shame...</p>
          </div>
        ) : entries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <p className="text-6xl mb-4">🏆</p>
            <p className="font-black text-xl mb-2">Clean Record!</p>
            <p className="text-foreground/40">No broken commitments. Keep it that way.</p>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-3">
            <AnimatePresence>
              {entries.map((entry, idx) => (
                <motion.div
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: removing === entry.id ? 0 : 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group flex items-start gap-4 bg-red-500/5 border border-red-500/15 rounded-2xl p-5 hover:border-red-500/30 transition-all"
                >
                  <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Skull size={18} className="text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground/90 leading-snug mb-1 line-clamp-2">
                      {entry.taskTitle}
                    </p>
                    <p className="text-foreground/40 text-sm italic mb-2">{entry.reason}</p>
                    <div className="flex items-center gap-3 text-foreground/30 text-xs">
                      <span className="flex items-center gap-1">
                        <Clock size={11} /> {timeAgo(entry.createdAt)}
                      </span>
                      {entry.user?.name && (
                        <span>· {entry.user.name}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="shrink-0 p-2 rounded-xl text-foreground/20 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                    title="Remove entry"
                  >
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Redemption CTA */}
        {entries.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-10 text-center"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-violet-600 to-blue-600 text-white font-black rounded-2xl shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:shadow-[0_0_50px_rgba(139,92,246,0.5)] transition-all uppercase tracking-wider text-sm"
            >
              <Flame size={18} /> Redeem Yourself — Start a New Mission
            </Link>
          </motion.div>
        )}
      </div>
    </main>
  );
}
