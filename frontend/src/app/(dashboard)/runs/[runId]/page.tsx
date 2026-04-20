"use client";

import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import { 
  Activity, 
  ChevronRight, 
  Terminal, 
  GitPullRequest, 
  CheckCircle2, 
  Clock, 
  ArrowLeft,
  Search,
  RefreshCw,
  Bell,
  Cpu,
  Loader2,
  XCircle,
  Shield
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { fetchRunById, subscribeToRun, applyFix } from "@/lib/api";

export default function RunDetailPage() {
  const { runId } = useParams();
  const [run, setRun] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [activeTab, setActiveTab] = useState("logs");

  const loadData = useCallback(async () => {
    try {
      const data = await fetchRunById(runId as string);
      setRun(data);
    } catch (err) {
      console.error("Failed to fetch run details:", err);
      // Fallback mock
      setRun({
        id: runId,
        repo: "frontend-app",
        branch: "main",
        status: "running",
        run_type: "Autonomous Fix",
        created_at: new Date().toISOString(),
        iterations: 1,
        max_iterations: 5,
        diagnosis: "Identified a race condition in the authentication middleware where the token was being cleared before the redirected page could read it.",
        repair_diff: "--- a/middleware.ts\n+++ b/middleware.ts\n- if (expired) clearToken();\n+ if (expired && !isRedirecting) clearToken();",
        logs: "[13:02:11] Starting sandbox...\n[13:02:14] Repositor cloned successfully.\n[13:02:18] Running initial test suite...\n[13:02:24] ERROR: Auth test failed (Timeout after 5000ms)\n[13:02:25] Triggering AI Diagnosis Agent...\n[13:02:31] Diagnosis complete: Race condition detected.\n[13:02:32] Proposing repair strategy...\n[13:02:35] Repair applied. Re-running tests..."
      });
    } finally {
      setIsLoading(false);
    }
  }, [runId]);

  useEffect(() => {
    loadData();
    
    // Subscribe to real-time updates
    const subscription = subscribeToRun(runId as string, (updatedRun) => {
      setRun(updatedRun);
    });

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [loadData, runId]);

  if (isLoading) return (
    <div className="flex min-h-screen bg-[#020617] items-center justify-center">
      <Loader2 className="animate-spin text-blue-500" size={48} />
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#020617] text-slate-200 font-[var(--font-inter)]">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-border-subtle bg-bg-surface px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-slate-800/40 rounded-lg transition-colors text-slate-500 hover:text-white">
              <ArrowLeft size={18} />
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-sm">Runs</span>
              <ChevronRight size={14} className="text-slate-700" />
              <span className="text-white font-bold">{runId}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[11px] font-bold border border-blue-500/10">
               {run?.run_type}
             </div>
             <StatusBadge status={run?.status} />
          </div>
        </header>

        {/* Detailed Content */}
        <section className="flex-1 overflow-y-auto p-8 lg:p-10">
          <div className="max-w-6xl mx-auto space-y-8 pb-20">
            {/* Summary Card */}
            <div className="p-6 rounded-2xl border border-border-subtle bg-bg-surface space-y-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-white capitalize">{run?.repo} Fix Execution</h2>
                  <p className="text-sm text-slate-500">Autonomous resolution started {new Date(run?.created_at).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Iteration</p>
                  <p className="text-2xl font-mono font-bold text-blue-400">{run?.iterations} <span className="text-slate-700 text-sm">/ {run?.max_iterations}</span></p>
                </div>
              </div>

              {/* Progress Stepper */}
              <div className="flex items-center justify-between px-4 pt-4 border-t border-slate-800/40">
                <StepItem label="Observation" status="completed" />
                <div className="flex-1 h-px bg-slate-800 mx-2" />
                <StepItem label="Diagnosis" status={run?.status === 'running' && !run?.diagnosis ? 'current' : 'completed'} />
                <div className="flex-1 h-px bg-slate-800 mx-2" />
                <StepItem label="Repair" status={run?.status === 'running' && run?.diagnosis ? 'current' : (run?.status === 'completed' ? 'completed' : 'pending')} />
                <div className="flex-1 h-px bg-slate-800 mx-2" />
                <StepItem label="Validation" status={run?.status === 'completed' ? 'completed' : (run?.status === 'running' ? 'pending' : 'pending')} />
              </div>
            </div>

            {/* Analysis & Results */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               {/* Left: Logs & Diagnosis */}
               <div className="space-y-6">
                 <div className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                      <Terminal size={18} className="text-blue-400" />
                      Execution Logs
                    </h3>
                    <div className="h-[400px] rounded-2xl border border-slate-800/60 bg-[#020617] p-4 font-mono text-xs overflow-y-auto custom-scrollbar">
                       <pre className="text-slate-400 leading-relaxed">
                          {run?.logs || "Initializing logs..."}
                       </pre>
                    </div>
                 </div>

                 {run?.diagnosis && (
                   <div className="p-5 rounded-2xl border border-brand-primary/20 bg-brand-primary/5 space-y-3">
                     <h3 className="text-sm font-bold text-blue-400 flex items-center gap-2">
                       <Cpu size={16} />
                       AI Diagnosis Report
                     </h3>
                     <p className="text-sm text-slate-300 leading-relaxed italic">
                       "{run?.diagnosis}"
                     </p>
                   </div>
                 )}
               </div>

               {/* Right: Resolution View */}
               <div className="space-y-6">
                 <div className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                      <GitPullRequest size={18} className="text-success" />
                      Proposed Resolution
                    </h3>
                    <div className="h-[400px] rounded-2xl border border-border-subtle bg-bg-deep p-1 overflow-hidden flex flex-col">
                       {run?.repair_diff ? (
                         <div className="flex-1 p-4 font-mono text-xs overflow-y-auto">
                            <pre className="text-slate-300">
                               {run.repair_diff.split('\n').map((line: string, i: number) => (
                                 <div key={i} className={`py-0.5 ${line.startsWith('+') ? 'bg-emerald-500/10 text-emerald-400' : line.startsWith('-') ? 'bg-red-500/10 text-red-400' : ''}`}>
                                   {line}
                                 </div>
                               ))}
                            </pre>
                         </div>
                       ) : (
                         <div className="flex-1 flex flex-col items-center justify-center gap-4 text-slate-600">
                            <RefreshCw className="animate-spin" size={32} />
                            <p className="text-sm font-medium italic">Agent is crafting a repair strategy...</p>
                         </div>
                       )}
                       <div className="p-4 bg-slate-900/40 border-t border-slate-800/60 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate max-w-[200px]">
                            {run?.target_file ? `Target: ${run.target_file}` : 'Analyzing target...'}
                          </span>
                          {run?.pr_url ? (
                            <Link 
                              href={run.pr_url}
                              target="_blank"
                              className="px-4 py-1.5 rounded-lg bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 text-[11px] font-bold transition-all border border-emerald-500/20 flex items-center gap-2"
                            >
                              <GitPullRequest size={14} />
                              View Pull Request
                            </Link>
                          ) : (
                            <button 
                              onClick={async () => {
                                setIsApplying(true);
                                try {
                                  await applyFix(runId as string);
                                  await loadData();
                                } catch (err) {
                                  console.error(err);
                                } finally {
                                  setIsApplying(false);
                                }
                              }}
                              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition-all disabled:opacity-50 flex items-center gap-2" 
                              disabled={!run?.repair_diff || isApplying || run?.status === 'completed'}
                            >
                              {isApplying ? <Loader2 size={14} className="animate-spin" /> : <GitPullRequest size={14} />}
                              {isApplying ? "Creating PR..." : "Approve & Apply"}
                            </button>
                          )}
                       </div>
                    </div>
                 </div>
               </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function StepItem({ label, status }: { label: string; status: 'completed' | 'current' | 'pending' }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${
        status === 'completed' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' :
        status === 'current' ? 'bg-blue-500 animate-pulse' : 'bg-slate-800'
      }`} />
      <span className={`text-[10px] font-bold uppercase tracking-widest ${
        status === 'pending' ? 'text-slate-600' : 'text-slate-400'
      }`}>{label}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { color: string; bg: string; icon: any; label: string; animate?: string }> = {
    completed: { color: "text-emerald-400", bg: "bg-emerald-500/10", icon: CheckCircle2, label: "Resolved" },
    failed: { color: "text-red-400", bg: "bg-red-500/10", icon: XCircle, label: "Failed" },
    escalated: { color: "text-amber-400", bg: "bg-amber-500/10", icon: Shield, label: "Escalated" },
    running: { color: "text-blue-400", bg: "bg-blue-500/10", icon: Loader2, label: "In Progress", animate: "animate-spin" },
    queued: { color: "text-amber-400", bg: "bg-amber-500/10", icon: Clock, label: "Queued" },
  };
  const config = configs[status] || configs.queued;
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl ${config.bg} ${config.color} border border-current/10`}>
      <Icon size={14} className={config.animate} />
      <span className="text-xs font-bold leading-none">{config.label}</span>
    </div>
  );
}
