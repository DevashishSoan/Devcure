"use client";

import React from "react";
import { motion } from "framer-motion";
import { Zap, Clock, Cpu, Bug, TrendingUp } from "lucide-react";
import { formatMTTR } from "@/lib/utils";
import { MagneticCard } from "@/components/landing/MagneticCard";

export default function StatsGrid({ stats, isLoading }: { stats: any; isLoading: boolean }) {
  const statCards = stats ? [
    { 
      label: "Autonomous Success", 
      value: stats.autonomous_resolution_rate != null ? `${stats.autonomous_resolution_rate}%` : '—', 
      icon: Zap,
      sparkline: [20, 40, 35, 50, 45, 60, 75],
    },
    { 
      label: "Mean Resolution", 
      value: stats.mean_time_to_resolution != null ? formatMTTR(stats.mean_time_to_resolution) : '—', 
      icon: Clock,
      sparkline: [70, 65, 60, 55, 58, 45, 40],
    },
    { 
      label: "Compute Threads", 
      value: stats.active_sandboxes != null ? `${stats.active_sandboxes}` : '—', 
      icon: Cpu,
      sparkline: [30, 32, 35, 33, 31, 34, 35],
    },
    { 
      label: "Resolved Cycles", 
      value: stats.bugs_fixed_month != null ? `${stats.bugs_fixed_month}` : '—', 
      icon: Bug,
      sparkline: [10, 15, 25, 20, 30, 45, 50],
    },
  ] : [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-44 rounded-[32px] bg-zinc-950/40 border border-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, i) => (
        <MagneticCard
          key={i}
          delay={i * 0.1}
          className="relative group overflow-hidden"
        >
          {/* Cyan Glow Accent */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#0891B2]/5 blur-[60px] rounded-full group-hover:bg-[#0891B2]/15 transition-all duration-700" />
          
          <div className="flex items-start justify-between mb-8 relative z-10">
            <div className="relative">
              <div className="absolute inset-0 bg-[#0891B2]/20 blur-md rounded-2xl animate-pulse" />
              <div className="relative p-3.5 rounded-2xl bg-zinc-950 border border-[#0891B2]/30 text-[#0891B2] shadow-[0_0_20px_rgba(8,145,178,0.15)] group-hover:border-[#0891B2]/60 transition-colors">
                <stat.icon size={22} strokeWidth={2.5} className="group-hover:scale-110 transition-transform duration-500" />
              </div>
            </div>
            
            {/* Micro-Sparkline */}
            <div className="flex items-end gap-1.5 h-10 px-2 bg-white/[0.02] rounded-xl border border-white/[0.03]">
              {stat.sparkline.map((val, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ height: 0 }}
                  animate={{ height: `${(val / 80) * 100}%` }}
                  className="w-1.5 bg-[#0891B2]/10 rounded-full group-hover:bg-[#0891B2]/40 transition-all duration-500"
                />
              ))}
            </div>
          </div>

          <div className="relative z-10 space-y-4">
            <div>
              <p className="text-5xl font-bold text-white tracking-tighter mb-1 font-mono leading-none group-hover:text-[#0891B2] transition-colors duration-500">
                {stat.value}
              </p>
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/5 border border-emerald-500/20">
                  <TrendingUp size={10} className="text-emerald-500" />
                  <span className="text-[8px] font-bold text-emerald-500">OPTIMIZED</span>
                </div>
                <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em] font-display">
                  {stat.label}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.03] flex items-center justify-between">
              <span className="text-[8px] font-bold text-zinc-700 uppercase tracking-widest">Protocol_v4.2</span>
              <div className="flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981]" />
                <span className="text-[8px] font-black text-zinc-600 uppercase">Hardware_Link_Stable</span>
              </div>
            </div>
          </div>
        </MagneticCard>
      ))}
    </div>
  );
}
