"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Plus,
  RefreshCw,
  ChevronRight,
  TrendingUp,
  Cpu,
  Terminal,
  Shield,
  Zap,
  Search,
  CheckCircle2,
  Lock,
  Radio,
} from "lucide-react";
import { useStats } from "@/hooks/useStats";
import { useRuns } from "@/hooks/useRuns";
import { useInsights } from "@/hooks/useInsights";
import { formatTime, formatMTTR } from "@/lib/utils";
import AIStrategyModal from "@/components/AIStrategyModal";
import OnboardingChecklist from "@/components/OnboardingChecklist";
import StatsGrid from "@/components/StatsGrid";
import { MagneticCard } from "@/components/landing/MagneticCard";
import RunsTable from "@/components/RunsTable";
import RunDetailModal from "@/components/RunDetailModal";


export default function Dashboard() {
  const { runs, isLoading: runsLoading } = useRuns(10);
  const { stats, isLoading: statsLoading } = useStats();
  const insights = useInsights(runs);
  const [isStrategyModalOpen, setIsStrategyModalOpen] = useState(false);
  const [selectedRun, setSelectedRun] = useState<any | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="h-full flex flex-col bg-transparent relative">
      
      {/* Glass Header */}
      <header className="h-20 px-10 flex items-center justify-between border-b border-white/5 bg-zinc-950/40 backdrop-blur-xl z-20 shrink-0">
        <div className="flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.3em]">
           <span className="text-zinc-600">Protocol</span>
           <ChevronRight size={14} className="text-zinc-800" />
           <span className="text-[#0891B2]">Neural_Dashboard</span>
        </div>
        
        <div className="flex items-center gap-8">
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-[#0891B2] transition-colors" size={14} />
              <input 
                type="text" 
                placeholder="Global Probe Search..." 
                className="bg-white/5 border border-white/10 rounded-full py-2.5 pl-11 pr-6 text-[12px] text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-[#0891B2]/40 transition-all w-64 backdrop-blur-md"
              />
           </div>
           
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 pr-4 border-r border-white/5">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
                 <span className="text-[10px] font-black text-white uppercase tracking-widest">Devashish S.</span>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center font-bold text-xs text-[#0891B2]">
                 DS
              </div>
           </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-10 custom-scrollbar relative">
        <div className="max-w-[1600px] mx-auto space-y-10">
           
           {/* Section 1: Stats Grid */}
           <StatsGrid stats={stats} isLoading={statsLoading} />

            {/* Section 2: Main Activity List */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
               
               {/* Left Column: Main Activity */}
               <div className="xl:col-span-8 space-y-8">
                  <div className="flex items-center justify-between pb-2">
                     <div className="flex items-center gap-3">
                        <Terminal size={18} className="text-[#0891B2]" />
                        <h2 className="text-xs font-black text-white uppercase tracking-[0.4em]">Autonomous_Cycles</h2>
                     </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {(runs || []).length === 0 && !runsLoading ? (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.02 }}
                        key="idling"
                      >
                        <MagneticCard className="min-h-[550px] flex flex-col items-center justify-center text-center p-12 border-[#0891B2]/20 bg-[#0891B2]/5">
                          <div className="space-y-12">
                             {/* AI Pulse Graphic */}
                             <div className="relative flex items-center justify-center">
                                <motion.div 
                                  animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.1, 0.3] }}
                                  transition={{ duration: 4, repeat: Infinity }}
                                  className="absolute w-64 h-64 bg-[#0891B2]/20 rounded-full blur-[80px]"
                                />
                                <div className="relative w-40 h-40 rounded-full border border-[#0891B2]/30 flex items-center justify-center bg-zinc-950/50 backdrop-blur-3xl">
                                   <Activity className="text-[#0891B2] animate-pulse" size={56} />
                                   <motion.div 
                                     animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
                                     transition={{ duration: 3, repeat: Infinity }}
                                     className="absolute inset-0 border border-[#0891B2]/40 rounded-full"
                                   />
                                </div>
                             </div>
                             
                             <div className="max-w-md">
                                <h3 className="text-4xl font-bold text-white mb-4 font-display tracking-tight">System_Idling</h3>
                                <p className="text-zinc-500 mb-10 font-medium leading-relaxed">
                                   Neural network standing by. Monitoring repository endpoints for failure events. Deploy a probe to begin autonomous remediation.
                                </p>
                                
                                <button 
                                  onClick={() => document.getElementById('add-repo-modal-trigger')?.click()}
                                  className="px-12 py-5 bg-[#0891B2] text-black font-bold rounded-full text-[11px] uppercase tracking-[0.3em] hover:shadow-[0_0_50px_rgba(8,145,178,0.5)] transition-all transform hover:scale-105 active:scale-95 shadow-xl"
                                >
                                   Deploy_Neural_Probe
                                </button>
                             </div>
                          </div>
                        </MagneticCard>
                      </motion.div>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        key="active"
                        className="space-y-6"
                      >
                         <RunsTable 
                           runs={runs} 
                           isLoading={runsLoading} 
                           onSelectRun={setSelectedRun}
                         />
                      </motion.div>
                    )}
                  </AnimatePresence>
               </div>

              {/* Right Column: Insights & Stats */}
              <div className="xl:col-span-4 space-y-8">
                 
                 {/* Neural Protocol Stream (Live Feed) */}
                 <MagneticCard delay={0.4} className="bg-zinc-950/40 border-white/5 overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                       <div className="flex items-center gap-2">
                          <Radio size={14} className="text-[#0891B2] animate-pulse" />
                          <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Protocol_Stream</h3>
                       </div>
                       <span className="text-[9px] font-mono text-[#0891B2] bg-[#0891B2]/10 px-2 py-0.5 rounded border border-[#0891B2]/20 uppercase">Live_Telemetry</span>
                    </div>
                    
                    <div className="space-y-4 font-mono text-[11px] h-[180px] overflow-hidden mask-fade-bottom">
                       {[
                         { t: "14:22:01", msg: "Scanning_Node_Beta_Repos...", s: "info" },
                         { t: "14:22:04", msg: "Health_Check: Stable_Latency (12ms)", s: "success" },
                         { t: "14:22:09", msg: "Agent_V4_Standby: Awaiting_Event...", s: "info" },
                         { t: "14:22:15", msg: "Database_Sync: 100%_Complete", s: "success" },
                         { t: "14:22:20", msg: "Memory_Check: 4.2GB_Available", s: "info" },
                         { t: "14:22:28", msg: "Network_Pulse: Heartbeat_Sent", s: "info" },
                       ].map((log, i) => (
                         <motion.div 
                           key={i}
                           initial={{ opacity: 0, x: -10 }}
                           animate={{ opacity: 1, x: 0 }}
                           transition={{ delay: 1 + (i * 0.2) }}
                           className="flex gap-3 text-zinc-500"
                         >
                            <span className="text-zinc-700 shrink-0">{log.t}</span>
                            <span className={log.s === 'success' ? 'text-emerald-500/60' : 'text-zinc-400'}>
                              {log.msg}
                            </span>
                         </motion.div>
                       ))}
                    </div>
                 </MagneticCard>

                 {/* Insights Widget */}
                 <MagneticCard delay={0.5} className="relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#0891B2]/5 rounded-full blur-[40px] pointer-events-none" />
                    
                    <div className="flex items-center justify-between mb-10">
                       <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                          <Zap size={14} className="text-[#0891B2]" />
                          Neural_Insights
                       </h3>
                       <button className="text-[#0891B2] hover:text-white transition-colors group-hover:rotate-180 duration-700">
                          <RefreshCw size={14} />
                       </button>
                    </div>
                    
                    <div className="space-y-8 mb-12">
                       {insights.length > 0 ? insights.map((insight, i) => (
                         <div key={i} className="flex gap-5 group/item cursor-pointer">
                            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-[#0891B2] shadow-[0_0_8px_#0891B2] shrink-0 group-hover/item:scale-150 transition-transform" />
                            <div className="space-y-1.5">
                               <p className="text-[13px] font-bold text-white font-display group-hover/item:text-[#0891B2] transition-colors">{insight.title}</p>
                               <p className="text-[11px] leading-relaxed text-zinc-400 font-medium group-hover/item:text-zinc-300 transition-colors">{insight.body}</p>
                            </div>
                         </div>
                       )) : (
                         <p className="text-[11px] text-zinc-600 italic">Analyzing cycle patterns... Insight generation in progress.</p>
                       )}
                    </div>

                    <button 
                      onClick={() => setIsStrategyModalOpen(true)}
                      className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-zinc-500 text-[10px] font-bold uppercase tracking-widest hover:bg-[#0891B2]/10 hover:text-[#0891B2] hover:border-[#0891B2]/20 transition-all font-display"
                    >
                      Audit_Logic_Framework
                    </button>
                 </MagneticCard>

                 {/* Distribution Widget */}
                 <MagneticCard delay={0.6} className="bg-zinc-950/40">
                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-10">Load_Distribution</h3>
                    <div className="aspect-[16/7] w-full flex items-end justify-between px-2 gap-3">
                       {[40, 75, 45, 90, 65, 85, 55].map((h, i) => (
                          <div key={i} className="flex-1 rounded-t-lg bg-white/[0.02] relative group cursor-help h-full overflow-hidden border-x border-white/[0.02]">
                             <motion.div 
                               initial={{ height: 0 }}
                               animate={{ height: `${h}%` }}
                               transition={{ duration: 1.5, delay: 0.8 + (i * 0.1), ease: "circOut" }}
                               className="absolute bottom-0 left-0 w-full rounded-t-lg bg-gradient-to-t from-[#0891B2]/20 to-[#0891B2]/60 group-hover:from-[#0891B2]/40 group-hover:to-[#0891B2] transition-all"
                             />
                          </div>
                       ))}
                    </div>
                    <div className="flex justify-between mt-8 px-2">
                       {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((d, i) => (
                          <span key={`${d}-${i}`} className="text-[9px] font-bold text-zinc-700 font-mono">{d}</span>
                       ))}
                    </div>
                 </MagneticCard>

              </div>
            </div>

        </div>
      </div>

      <AIStrategyModal 
        isOpen={isStrategyModalOpen} 
        onClose={() => setIsStrategyModalOpen(false)} 
      />

      {selectedRun && (
        <RunDetailModal 
          run={selectedRun} 
          onClose={() => setSelectedRun(null)} 
        />
      )}
    </div>
  );
}
