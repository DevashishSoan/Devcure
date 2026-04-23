"use client";

import React, { useState, useEffect } from "react";
import {
  Activity,
  Plus,
  RefreshCw,
  Bell,
  ChevronRight,
  TrendingUp,
  Cpu,
  Clock,
  Terminal,
  Shield,
  Zap,
  Search,
  CheckCircle2,
} from "lucide-react";
import { supabase } from "@/lib/api";
import { useStats } from "@/hooks/useStats";
import { useRuns } from "@/hooks/useRuns";
import { useInsights } from "@/hooks/useInsights";
import { formatTime, formatMTTR } from "@/lib/utils";
import AIStrategyModal from "@/components/AIStrategyModal";
import OnboardingChecklist from "@/components/OnboardingChecklist";

export default function Dashboard() {
  const { runs, isLoading: runsLoading } = useRuns(10);
  const { stats, isLoading: statsLoading } = useStats();
  const insights = useInsights(runs);
  const [isStrategyModalOpen, setIsStrategyModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="h-full flex flex-col bg-black relative overflow-hidden">
      
      {/* Glass Header */}
      <header className="h-16 px-8 flex items-center justify-between border-b border-white/[0.05] bg-black/40 backdrop-blur-2xl z-20 shrink-0">
        <div className="flex items-center gap-4 text-xs font-medium">
           <span className="text-zinc-500">Platform</span>
           <ChevronRight size={14} className="text-zinc-800" />
           <span className="text-white">Dashboard</span>
        </div>
        
        <div className="flex items-center gap-6">
           <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-indigo-400 transition-colors" size={14} />
              <input 
                type="text" 
                placeholder="Global Search..." 
                className="bg-white/[0.03] border border-white/[0.05] rounded-lg py-1.5 pl-9 pr-4 text-[11px] text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/30 transition-all w-48"
              />
           </div>
           
           <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--acid-dim)] border border-[var(--acid)]/10">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--acid)] shadow-[0_0_8px_rgba(63,185,80,0.5)]" />
              <span className="text-[10px] font-bold text-[var(--acid)] uppercase tracking-widest">Active Link</span>
           </div>
           
           <div className="w-8 h-8 rounded-full bg-zinc-900 border border-white/[0.05] flex items-center justify-center">
              <span className="text-[10px] font-bold text-zinc-400">DS</span>
           </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
        <div className="max-w-7xl mx-auto space-y-12">
           
           {/* Section 1: Stats Grid (Premium Monochrome) */}
           <div className="bg-[var(--surface-2)] border border-white/[0.05] rounded-3xl p-8 animate-reveal shadow-2xl shadow-black/50">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: "Total Runs", val: stats?.total_runs || "1,284", icon: Zap, color: "text-indigo-400" },
                  { label: "Resolved", val: stats?.total_resolved || "1,052", icon: CheckCircle2, color: "text-emerald-400" },
                  { label: "Compute Logic", val: stats?.active_sandboxes || "0", icon: Cpu, color: "text-zinc-400" },
                  { label: "Global Uptime", val: "99.9%", icon: Activity, color: "text-sky-400" },
                ].map((stat, i) => (
                  <div key={i} className="p-2">
                     <div className="flex items-center justify-between mb-4">
                        <div className={`p-2 rounded-lg bg-white/[0.03] border border-white/[0.05] ${stat.color}`}>
                           <stat.icon size={16} />
                        </div>
                        <TrendingUp size={14} className="text-zinc-800" />
                     </div>
                     <p className="text-2xl font-bold text-white tracking-tight mb-1 font-display">{stat.val}</p>
                     <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none">{stat.label}</p>
                  </div>
                ))}
             </div>
           </div>

           {/* Section 2: Main Activity List (The Core) */}
           <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
              
              <div className="xl:col-span-8 space-y-6">
                 <div className="flex items-center justify-between pb-2">
                    <div className="flex items-center gap-3">
                       <Terminal size={18} className="text-indigo-500" />
                       <h2 className="text-sm font-bold text-white uppercase tracking-widest">Autonomous Cycles</h2>
                    </div>
                    <button 
                      onClick={() => document.getElementById('add-repo-modal-trigger')?.click()}
                      className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-[11px] font-bold hover:bg-indigo-500 transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20"
                    >
                       <Plus size={14} /> New Link
                    </button>
                 </div>

                 <div className="glass-quartz rounded-2xl overflow-hidden animate-reveal delay-100">
                    {(runs || []).length === 0 ? (
                      <div className="py-24 text-center">
                         <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center mx-auto mb-6">
                            <Activity className="text-zinc-800" size={24} />
                         </div>
                         <h3 className="text-sm font-bold text-zinc-300 mb-2">System Idling</h3>
                         <p className="text-xs text-zinc-600 max-w-xs mx-auto mb-8">Deploy an autonomous probe to begin monitoring your codebase infrastructure.</p>
                         <OnboardingChecklist />
                      </div>
                    ) : (
                      <div className="divide-y divide-white/[0.03]">
                         {runs.map((run: any) => (
                           <div 
                              key={run.id}
                              className="px-6 py-5 flex items-center gap-6 hover:bg-zinc-900/30 transition-colors cursor-pointer group"
                              onClick={() => {}}
                           >
                              <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center group-hover:border-indigo-500/30 transition-all">
                                 <Shield size={18} className="text-zinc-600 group-hover:text-indigo-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                 <div className="flex items-center gap-3 mb-1">
                                    <h4 className="text-sm font-bold text-zinc-100 truncate">{run.repo}</h4>
                                    <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-white/[0.05] text-[9px] font-bold text-zinc-500 uppercase">
                                       {run.run_type}
                                    </span>
                                 </div>
                                 <div className="flex items-center gap-3 text-[10px] text-zinc-600">
                                    <span>Branch: {run.branch}</span>
                                    <span>MTTR: {formatMTTR(run.mttr_seconds)}</span>
                                 </div>
                              </div>
                              
                              <div className="flex flex-col items-end gap-2 text-right">
                                 <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${run.status === 'completed' ? 'bg-emerald-500' : run.status === 'failed' ? 'bg-rose-500' : 'bg-indigo-500 animate-pulse'}`} />
                                    <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">{run.status}</span>
                                 </div>
                                 <span className="text-[9px] font-medium text-zinc-700">{formatTime(run.created_at)}</span>
                              </div>
                           </div>
                         ))}
                      </div>
                    )}
                 </div>
              </div>

              {/* Sidebar Widgets (Professional Quartz) */}
              <div className="xl:col-span-4 space-y-8">
                 
                 <div className="glass-quartz rounded-2xl p-7 relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-8">
                       <h3 className="text-[11px] font-black text-zinc-500 uppercase tracking-widest">Neural Protocols</h3>
                       <button className="text-indigo-400 hover:text-white transition-colors"><RefreshCw size={14} /></button>
                    </div>
                    
                    <div className="space-y-6 mb-10">
                       {insights.map((insight, i) => (
                         <div key={i} className="flex gap-4">
                            <div className="mt-1 w-2 h-2 rounded-full bg-indigo-500/20 border border-indigo-500/30 shrink-0" />
                            <div className="space-y-1">
                               <p className="text-[11px] font-bold text-zinc-200">{insight.title}</p>
                               <p className="text-[11px] leading-relaxed text-zinc-500 font-medium">{insight.body}</p>
                            </div>
                         </div>
                       ))}
                    </div>

                    <button 
                      onClick={() => setIsStrategyModalOpen(true)}
                      className="w-full py-4 rounded-xl bg-white/[0.03] border border-white/[0.05] text-zinc-400 text-[10px] font-bold uppercase tracking-widest hover:bg-white/[0.06] hover:text-white transition-all shadow-sm"
                    >
                      View Logic Strategy
                    </button>
                 </div>

                 {/* Activity History Style Widget */}
                 <div className="glass-quartz rounded-2xl p-7">
                    <h3 className="text-[11px] font-black text-zinc-500 uppercase tracking-widest mb-8">Audit Distribution</h3>
                    <div className="aspect-[4/3] w-full flex items-end justify-between px-2">
                       {[40, 75, 45, 90, 65, 85, 55].map((h, i) => (
                          <div key={i} className="w-4 rounded-t-full bg-white/[0.03] relative group group-hover:bg-indigo-500/10 transition-all cursor-help" style={{ height: '100%' }}>
                             <div className="absolute bottom-0 left-0 w-full rounded-t-full bg-indigo-600/40 group-hover:bg-indigo-600 transition-all duration-700" style={{ height: `${h}%` }} />
                          </div>
                       ))}
                    </div>
                    <div className="flex justify-between mt-6 px-1">
                       {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                          <span key={`${d}-${i}`} className="text-[10px] font-bold text-zinc-800">{d}</span>
                       ))}
                    </div>
                 </div>

              </div>

           </div>

        </div>
      </div>

      <AIStrategyModal 
        isOpen={isStrategyModalOpen} 
        onClose={() => setIsStrategyModalOpen(false)} 
      />
    </div>
  );
}
