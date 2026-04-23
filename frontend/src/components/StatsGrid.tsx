"use client";

import React from "react";
import { Zap, Clock, Cpu, Bug, ArrowUpRight } from "lucide-react";
import { formatMTTR } from "@/lib/utils";

export default function StatsGrid({ stats, isLoading }: { stats: any; isLoading: boolean }) {
  const statCards = stats ? [
    { 
      label: "Success Rate", 
      value: stats.autonomous_resolution_rate != null ? `${stats.autonomous_resolution_rate}%` : '—', 
      icon: Zap, 
      color: "text-sky-400", 
      bg: "bg-sky-500/5",
      trend: "+12%" 
    },
    { 
      label: "Avg. Resolution", 
      value: stats.mean_time_to_resolution != null ? formatMTTR(stats.mean_time_to_resolution) : '—', 
      icon: Clock, 
      color: "text-indigo-400", 
      bg: "bg-indigo-500/5",
      trend: "-4m"
    },
    { 
      label: "Compute Load", 
      value: stats.active_sandboxes != null ? `${stats.active_sandboxes}` : '—', 
      sub: `/ 200`, 
      icon: Cpu, 
      color: "text-emerald-400", 
      bg: "bg-emerald-500/5",
      trend: "STABLE"
    },
    { 
      label: "Monthly Resolve", 
      value: stats.bugs_fixed_month != null ? `${stats.bugs_fixed_month}` : '—', 
      icon: Bug, 
      color: "text-zinc-100", 
      bg: "bg-white/5",
      trend: "SYNCED"
    },
  ] : [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 rounded-2xl border border-white/[0.05] bg-zinc-900/50 shimmer-mask overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent animate-shimmer" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, i) => (
        <div
          key={i}
          className="glass-panel p-6 rounded-2xl group relative overflow-hidden"
        >
          {/* Subtle Accent Glow */}
          <div className={`absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 blur-3xl opacity-20 transition-opacity duration-700 ${stat.bg}`} />
          
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2.5 rounded-lg bg-zinc-800/50 border border-white/[0.05] ${stat.color}`}>
              <stat.icon size={18} strokeWidth={2} />
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-500 tracking-wider">
              {stat.trend}
              <ArrowUpRight size={10} />
            </div>
          </div>

          <div className="relative z-10">
            <p className="text-2xl font-semibold text-white tracking-tight leading-none mb-1.5 font-display">
              {stat.value}
              {stat.sub && <span className="text-xs text-zinc-600 font-medium ml-1.5">{stat.sub}</span>}
            </p>
            <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-widest">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
