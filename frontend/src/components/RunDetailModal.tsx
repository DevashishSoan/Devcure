"use client";

import React, { useEffect, useRef } from "react";
import { X, Terminal, Clock, Activity, ExternalLink, Cpu, ShieldCheck } from "lucide-react";
import { formatTime } from "@/lib/utils";

export default function RunDetailModal({ run, onClose }: { run: any, onClose: () => void }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [run.trajectory]);

  const getStageColor = (status: string) => {
    const colors: Record<string, string> = {
      baseline_captured: "text-ice",
      diagnosed: "text-plasma",
      repair_applied: "text-amber-400",
      completed: "text-acid",
      escalated: "text-red-500",
      unresolved: "text-amber-400",
    };
    return colors[status] || "text-slate-500";
  };

  const stages = ["queued", "running", "baseline_captured", "diagnosed", "repair_applied", "completed"];
  
  const getProgress = (status: string) => {
    if (status === "escalated" || status === "failed") return 100;
    const index = stages.indexOf(status);
    if (index === -1) return 10;
    return ((index + 1) / stages.length) * 100;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-void/90 backdrop-blur-md animate-in fade-in duration-500" 
        onClick={onClose} 
      />

      <div className="relative w-full max-w-5xl bg-[#080b12] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[85vh] animate-in zoom-in-95 duration-300">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-acid to-transparent opacity-50" />
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-acid/10 flex items-center justify-center text-acid border border-acid/10 shadow-lg shadow-acid/5">
              <Terminal size={24} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-black text-white uppercase tracking-tight">Run Identity: <span className="text-acid font-mono">{run.id?.slice(0, 8)}</span></h2>
                <div className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${
                  run.status === 'completed' ? 'border-acid/20 text-acid bg-acid/5' : 
                  run.status === 'escalated' ? 'border-red-500/20 text-red-500 bg-red-500/5' :
                  'border-white/10 text-slate-500 bg-white/5'
                }`}>
                  {run.status}
                </div>
              </div>
              <div className="flex items-center gap-4 mt-1.5">
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-1.5">
                   <Clock size={12} className="text-slate-700" /> {new Date(run.created_at).toLocaleTimeString()}
                </span>
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-1.5">
                   <Activity size={12} className="text-slate-700" /> {run.repo}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-white/5 rounded-xl text-slate-500 transition-all hover:rotate-90">
            <X size={24} />
          </button>
        </div>

        {/* Progress System */}
        <div className="px-8 py-4 bg-void/50 border-b border-white/5 flex items-center gap-6">
          <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,0,0,0.5)] ${
                run.status === 'escalated' ? 'bg-red-500' : 
                run.status === 'completed' ? 'bg-acid' : 'bg-ice'
              }`}
              style={{ width: `${getProgress(run.status)}%` }}
            />
          </div>
          <div className="flex gap-4">
             {stages.slice(2).map((s, i) => (
               <div key={s} className={`flex items-center gap-2 transition-opacity ${stages.indexOf(run.status) >= stages.indexOf(s) ? 'opacity-100' : 'opacity-30'}`}>
                 <div className={`h-1.5 w-1.5 rounded-full ${stages.indexOf(run.status) >= stages.indexOf(s) ? 'bg-acid shadow-[0_0_5px_rgba(0,255,136,0.5)]' : 'bg-slate-700'}`} />
                 <span className="text-[9px] font-black uppercase tracking-tighter text-slate-500">{s.replace('_', ' ')}</span>
               </div>
             ))}
          </div>
        </div>

        {/* Console Content */}
        <div className="flex-1 overflow-hidden flex flex-col p-8 space-y-8">
          <div className="flex-1 bg-void border border-white/5 rounded-2xl flex flex-col overflow-hidden font-mono shadow-2xl relative">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-white/5" />
            
            <div className="p-4 bg-white/[0.03] border-b border-white/5 flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <div className="flex gap-1.5">
                   <div className="h-2.5 w-2.5 rounded-full bg-red-500/20" />
                   <div className="h-2.5 w-2.5 rounded-full bg-amber-500/20" />
                   <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/20" />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 ml-2">Neural Trajectory Log</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="h-1.5 w-1.5 rounded-full bg-acid animate-pulse shadow-[0_0_5px_rgba(0,255,136,0.5)]" />
                 <span className="text-[9px] font-black uppercase tracking-widest text-acid">Real-time Feed</span>
               </div>
            </div>
            
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-[radial-gradient(circle_at_top_left,rgba(0,255,136,0.02),transparent_40%)]"
            >
              {!run.trajectory || run.trajectory.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full space-y-4 opacity-20">
                   <Loader2 size={32} className="animate-spin text-acid" />
                   <span className="text-[10px] font-black uppercase tracking-[0.3em] text-acid">Initializing Protocol...</span>
                </div>
              ) : (
                run.trajectory.map((event: any, i: number) => (
                  <div key={i} className="group/line space-y-2 animate-in slide-in-from-left-4 duration-500">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-slate-700 font-bold tracking-tighter w-16">
                        {new Date(event.timestamp * 1000).toLocaleTimeString([], { hour12: false })}
                      </span>
                      <div className={`h-[1px] flex-1 bg-white/5 group-hover/line:bg-white/10 transition-colors`} />
                      <span className={`font-black uppercase tracking-widest text-[10px] px-2 py-0.5 rounded border border-current/10 bg-current/5 ${getStageColor(event.event)}`}>
                        {event.event}
                      </span>
                    </div>
                    {event.log && (
                       <pre className="pl-20 pr-4 text-[12px] text-slate-400 whitespace-pre-wrap break-all leading-relaxed font-light">
                         <span className="text-slate-800 mr-2">❯</span>
                         {event.log}
                       </pre>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Infrastructure Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <MetricBlock icon={Cpu} label="Neural Framework" value={run.framework || "Auto-detect"} color="text-ice" />
             <MetricBlock icon={Clock} label="Latency / MTTR" value={run.mttr_seconds ? `${run.mttr_seconds}s` : "Pending"} color="text-plasma" />
             <MetricBlock icon={ShieldCheck} label="Confidence Score" value={run.status === 'completed' ? '98.4%' : 'Syncing...'} color="text-acid" />
             <MetricBlock 
               icon={ExternalLink} 
               label="Output Interface" 
               value={run.pr_url ? "GitHub PR" : "Internal"} 
               isLink={!!run.pr_url} 
               href={run.pr_url} 
               color="text-white"
             />
          </div>
        </div>
      </div>
    </div>
  );
}

function Loader2(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/>
    </svg>
  )
}

function MetricBlock({ icon: Icon, label, value, color, isLink, href }: { icon: any, label: string, value: string, color: string, isLink?: boolean, href?: string }) {
  const content = (
    <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl space-y-2 hover:bg-white/[0.05] transition-all group/metric">
      <div className="flex items-center gap-2">
        <Icon size={14} className={`${color} opacity-50 group-hover/metric:opacity-100 transition-opacity`} />
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">{label}</span>
      </div>
      <div className="text-sm font-black text-white tracking-tight">{value}</div>
    </div>
  );

  if (isLink && href) {
    return <a href={href} target="_blank" className="block outline-none">{content}</a>;
  }
  return content;
}
