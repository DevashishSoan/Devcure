"use client";

import React from "react";
import { Zap, Clock, Cpu, Bug } from "lucide-react";

export default function StatsGrid({ stats, isLoading }: { stats: any; isLoading: boolean }) {
  const statCards = stats ? [
    { label: "Autonomous Resolution Rate", value: `${stats.arr_percent}%`, trend: "+5.4%", icon: Zap, color: "#3b82f6", glow: "shadow-blue-500/20" },
    { label: "Mean Time to Resolution", value: stats.avg_mttr_display, trend: "-12s", icon: Clock, color: "#10b981", glow: "shadow-emerald-500/20" },
    { label: "Active Sandboxes", value: `${stats.active_sandboxes}`, sub: `/ ${stats.max_sandboxes}`, trend: "Normal", icon: Cpu, color: "#f59e0b", glow: "shadow-amber-500/20" },
    { label: "Bugs Fixed (Month)", value: `${stats.bugs_fixed_month}`, trend: "+24%", icon: Bug, color: "#ef4444", glow: "shadow-red-500/20" },
  ] : [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-36 rounded-2xl border border-slate-800/40 bg-slate-900/30 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {statCards.map((stat, i) => (
        <div
          key={i}
          className={`p-5 rounded-2xl border border-slate-800/40 bg-[#0a0f1e]/60 hover:border-slate-700/50 transition-all duration-300 group hover:shadow-lg ${stat.glow} animate-fade-in`}
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 rounded-xl bg-slate-800/50 group-hover:bg-slate-800 transition-colors">
              <stat.icon size={18} style={{ color: stat.color }} />
            </div>
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
              stat.trend.startsWith("+") ? "bg-emerald-500/10 text-emerald-400" :
              stat.trend.startsWith("-") ? "bg-emerald-500/10 text-emerald-400" :
              "bg-slate-700/30 text-slate-400"
            }`}>
              {stat.trend}
            </span>
          </div>
          <p className="text-2xl font-bold text-white mb-0.5">
            {stat.value}
            {stat.sub && <span className="text-sm text-slate-500 font-medium ml-1">{stat.sub}</span>}
          </p>
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
