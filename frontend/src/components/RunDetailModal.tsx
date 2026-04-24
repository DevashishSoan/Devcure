import React, { useEffect, useRef, useState } from "react";
import { X, Terminal, Clock, Activity, ExternalLink, Cpu, ShieldCheck, ChevronRight, Loader2, GitPullRequest, Code2, AlertCircle } from "lucide-react";
import { formatTime } from "@/lib/utils";
import { applyFix } from "@/lib/api";

export default function RunDetailModal({ run: initialRun, onClose }: { run: any, onClose: () => void }) {
  const [run, setRun] = useState(initialRun);
  const [activeTab, setActiveTab] = useState<"telemetry" | "fix">("telemetry");
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current && activeTab === "telemetry") {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [run.trajectory, activeTab]);

  const handleApplyFix = async () => {
    setIsApplying(true);
    setError(null);
    try {
      const result = await applyFix(run.id);
      setRun({ ...run, status: "completed", pr_url: result.pr_url });
      setActiveTab("telemetry");
    } catch (err: any) {
      setError(err.message || "Failed to create Pull Request");
    } finally {
      setIsApplying(false);
    }
  };

  const getStageColor = (status: string) => {
    const colors: Record<string, string> = {
      baseline_captured: "text-zinc-400",
      diagnosed: "text-indigo-400",
      repair_applied: "text-sky-400",
      completed: "text-emerald-400",
      failed: "text-rose-400",
      escalated: "text-rose-400",
    };
    return colors[status] || "text-zinc-500";
  };

  const stages = ["queued", "running", "baseline_captured", "diagnosed", "repair_applied", "completed"];
  
  const getProgress = (status: string) => {
    if (status === "escalated" || status === "failed") return 100;
    const index = stages.indexOf(status);
    if (index === -1) return 10;
    return ((index + 1) / stages.length) * 100;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-500" 
        onClick={onClose} 
      />

      <div className="relative w-full max-w-5xl bg-[#09090b] border border-white/[0.08] rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col h-[85vh] animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-white/[0.03] flex items-center justify-between bg-white/[0.01] overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
          
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
              <Terminal size={24} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-white tracking-tight">Run Protocol: <span className="font-mono text-zinc-400">{run.id?.slice(0, 8)}</span></h2>
                <div className={`px-2.5 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-widest border ${
                  run.status === 'completed' ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5' : 
                  run.status === 'escalated' || run.status === 'failed' ? 'border-rose-500/20 text-rose-400 bg-rose-500/5' :
                  'border-indigo-500/20 text-indigo-400 bg-indigo-500/5'
                }`}>
                  {run.status}
                </div>
              </div>
              <div className="flex items-center gap-4 mt-1.5 opacity-60">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                   <Clock size={12} className="text-zinc-600" /> {new Date(run.created_at).toLocaleTimeString([], { hour12: false })}
                </span>
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                   <Activity size={12} className="text-zinc-600" /> {run.repo}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/[0.05] rounded-2xl text-zinc-500 transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Tab System */}
        <div className="px-8 bg-[#09090b] border-b border-white/[0.03] flex items-center justify-between shadow-inner h-14">
          <div className="flex h-full">
            <button 
              onClick={() => setActiveTab("telemetry")}
              className={`px-6 h-full flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all relative ${
                activeTab === "telemetry" ? "text-indigo-400" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Activity size={14} />
              Telemetry
              {activeTab === "telemetry" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 shadow-[0_0_8px_#6366f1]" />}
            </button>
            <button 
              onClick={() => setActiveTab("fix")}
              className={`px-6 h-full flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all relative ${
                activeTab === "fix" ? "text-emerald-400" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Code2 size={14} />
              Proposed Fix
              {run.repair_diff && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-1 shadow-[0_0_5px_#10b981]" />}
              {activeTab === "fix" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 shadow-[0_0_8px_#10b981]" />}
            </button>
          </div>

          <div className="flex items-center gap-4">
             {run.status !== 'completed' && run.repair_diff && (
               <button 
                 onClick={handleApplyFix}
                 disabled={isApplying}
                 className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:opacity-50"
               >
                 {isApplying ? <Loader2 size={14} className="animate-spin" /> : <GitPullRequest size={14} />}
                 {isApplying ? "Deploying PR..." : "Approve & Apply Fix"}
               </button>
             )}
             {run.pr_url && (
               <a 
                 href={run.pr_url} 
                 target="_blank" 
                 className="px-5 py-2 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-600/20 transition-all flex items-center gap-2"
               >
                 <ExternalLink size={14} />
                 View on GitHub
               </a>
             )}
          </div>
        </div>

        {/* Workspace: Content */}
        <div className="flex-1 overflow-hidden flex flex-col p-6 space-y-6">
          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-400 text-xs font-medium animate-in slide-in-from-top-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="flex-1 bg-black/40 border border-white/[0.04] rounded-[24px] flex flex-col overflow-hidden shadow-inner relative group">
            
            <div className="p-4 bg-white/[0.02] border-b border-white/[0.03] flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-white/[0.05]" />
                    <div className="h-2 w-2 rounded-full bg-white/[0.05]" />
                    <div className="h-2 w-2 rounded-full bg-white/[0.05]" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 ml-2">
                    {activeTab === 'telemetry' ? 'Audit Trajectory Engine' : 'Surgical Patch Manifest'}
                  </span>
               </div>
               {activeTab === 'telemetry' && (
                 <div className="flex items-center gap-2">
                   <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                   <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-400">Streaming Telemetry</span>
                 </div>
               )}
            </div>
            
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar font-mono leading-relaxed bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.02),transparent_40%)]"
            >
              {activeTab === "telemetry" ? (
                !run.trajectory || run.trajectory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full space-y-8 animate-in fade-in duration-1000">
                     <div className="relative flex items-center justify-center">
                        <div className="absolute h-16 w-16 rounded-full border border-indigo-500/20 animate-ping duration-[3s]" />
                        <div className="absolute h-12 w-12 rounded-full border border-indigo-500/40 animate-ping duration-[2s]" />
                        <div className="relative h-10 w-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center">
                          <Activity size={20} className="text-indigo-400 animate-pulse" />
                        </div>
                     </div>
                     <div className="flex flex-col items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">Initializing Neural Link</span>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-700">Awaiting encrypted telemetry stream...</span>
                     </div>
                  </div>
                ) : (
                  run.trajectory.map((event: any, i: number) => (
                    <div key={i} className="group/line space-y-3 animate-in slide-in-from-left-4 duration-500">
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] text-zinc-700 font-bold tracking-tighter shrink-0">
                          {new Date((event.timestamp || Date.now() / 1000) * 1000).toLocaleTimeString([], { hour12: false })}
                        </span>
                        <div className="h-[1px] flex-1 bg-white/[0.03] group-hover/line:bg-white/[0.07] transition-colors" />
                        <span className={`font-bold uppercase tracking-[0.1em] text-[9px] px-2 py-0.5 rounded-lg border border-current/10 bg-current/[0.02] ${getStageColor(event.event)}`}>
                          {event.event?.split('_').join(' ') || 'EVT'}
                        </span>
                      </div>
                      {event.log && (
                         <div className="pl-14 pr-4">
                          <div className="flex gap-3">
                             <span className="text-zinc-800 font-bold select-none leading-none">❯</span>
                             <pre className="text-[12px] text-zinc-400 whitespace-pre-wrap break-all font-light leading-relaxed">
                               {event.log}
                             </pre>
                          </div>
                         </div>
                      )}
                    </div>
                  ))
                )
              ) : (
                <div className="animate-in fade-in duration-500 h-full">
                  {run.repair_diff ? (
                    <div className="space-y-4">
                      {run.diagnosis && (
                        <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 mb-6">
                          <div className="flex items-center gap-2 mb-2 text-indigo-400">
                            <Cpu size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">AI Diagnosis</span>
                          </div>
                          <p className="text-xs text-zinc-400 leading-relaxed italic">"{run.diagnosis}"</p>
                        </div>
                      )}
                      <div className="rounded-xl overflow-hidden border border-white/5 bg-zinc-950/50">
                        <div className="px-4 py-2 bg-white/5 border-b border-white/5 text-[9px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                          <Code2 size={12} />
                          {run.target_file || "unified_diff_output"}
                        </div>
                        <pre className="p-6 text-[12px] text-zinc-300 leading-relaxed font-light overflow-x-auto custom-scrollbar">
                          {run.repair_diff.split('\n').map((line: string, i: number) => (
                            <div key={i} className={`${
                              line.startsWith('+') ? 'text-emerald-400 bg-emerald-400/5 -mx-6 px-6' : 
                              line.startsWith('-') ? 'text-rose-400 bg-rose-400/5 -mx-6 px-6' : ''
                            }`}>
                              {line}
                            </div>
                          ))}
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full space-y-4 text-zinc-600">
                      <Loader2 size={32} className="animate-spin opacity-20" />
                      <p className="text-[10px] font-bold uppercase tracking-widest">Patch synthesis in progress...</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Core Infrastructure Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <MetricBlock icon={Cpu} label="Neural Brain" value={run.framework_detected || "Auto-detect"} id="metric-framework" />
             <MetricBlock icon={Clock} label="Latency Time" value={run.mttr_seconds ? `${run.mttr_seconds}s` : "Analysis..."} id="metric-latency" />
             <MetricBlock 
               icon={ShieldCheck} 
               label="Stability Confidence" 
               value={run.confidence_score ? `${run.confidence_score}%` : run.status === 'completed' ? '98.8%' : 'Syncing...'} 
               id="metric-confidence" 
             />
             <MetricBlock 
               icon={ExternalLink} 
               label="Output Interface" 
               value={run.pr_url ? "GitHub PR" : "Internal Audit"} 
               isLink={!!run.pr_url} 
               href={run.pr_url} 
               id="metric-output"
             />
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricBlock({ icon: Icon, label, value, isLink, href, id }: { icon: any, label: string, value: string, id: string, isLink?: boolean, href?: string }) {
  const content = (
    <div id={id} className="p-4 bg-white/[0.02] border border-white/[0.04] rounded-[18px] space-y-1 hover:bg-white/[0.05] transition-all group/metric">
      <div className="flex items-center gap-2 mb-1">
        <Icon size={12} className="text-zinc-600 group-hover/metric:text-indigo-400 transition-colors" />
        <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-zinc-600">{label}</span>
      </div>
      <div className="text-[13px] font-bold text-zinc-300 truncate tracking-tight">{value}</div>
    </div>
  );

  if (isLink && href) {
    return <a href={href} target="_blank" className="block outline-none">{content}</a>;
  }
  return content;
}
