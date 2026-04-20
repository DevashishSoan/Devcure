"use client";

import React from "react";
import { Zap, Clock, Cpu, Bug } from "lucide-react";
import { formatMTTR } from "@/lib/utils";

export default function StatsGrid({ stats, isLoading }: { stats: any; isLoading: boolean }) {
  const statCards = stats ? [
    { 
      label: "Autonomous Resolution", 
      value: stats.autonomous_resolution_rate != null ? `${stats.autonomous_resolution_rate}%` : '—', 
      trend: "LIVE", 
      icon: Zap, 
      color: "text-acid", 
      glow: "shadow-acid/20",
      bg: "bg-acid/10"
    },
    { 
      label: "Mean Time to Resolution", 
      value: stats.mean_time_to_resolution != null ? formatMTTR(stats.mean_time_to_resolution) : '—', 
      trend: "AVG", 
      icon: Clock, 
      color: "text-ice", 
      glow: "shadow-ice/20",
      bg: "bg-ice/10"
    },
    { 
      label: "Active Sandboxes", 
      value: stats.active_sandboxes != null ? `${stats.active_sandboxes}` : '—', 
      sub: `/ 200`, 
      trend: "SYS", 
      icon: Cpu, 
      color: "text-plasma", 
      glow: "shadow-plasma/20",
      bg: "bg-plasma/10"
    },
    { 
      label: "Bugs Fixed (Month)", 
      value: stats.bugs_fixed_month != null ? `${stats.bugs_fixed_month}` : '—', 
      trend: "SYNC", 
      icon: Bug, 
      color: "text-white", 
      glow: "shadow-white/10",
      bg: "bg-white/10"
    },
  ] : [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-40 rounded-2xl border border-white/5 bg-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {statCards.map((stat, i) => (
        <div
          key={i}
          className={`relative p-8 rounded-2xl border border-white/5 bg-[#080b12]/60 backdrop-blur-md transition-all duration-500 group overflow-hidden hover:border-white/20`}
        >
          <div className={`absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 blur-[60px] opacity-0 group-hover:opacity-40 transition-opacity duration-700 ${stat.bg}`} />
          
          <div className="flex items-center justify-between mb-6">
            <div className={`p-3 rounded-xl bg-white/5 group-hover:scale-110 transition-transform duration-300 ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase">
              {stat.trend}
            </span>
          </div>
          <div className="relative z-10">
            <p className="text-3xl font-black text-white tracking-tighter mb-1 select-none">
              {stat.value}
              {stat.sub && <span className="text-[11px] text-slate-600 font-bold ml-1.5 uppercase tracking-widest">{stat.sub}</span>}
            </p>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
