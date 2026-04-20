"use client";

import React, { useState } from "react";
import {
  Activity,
  FolderGit2,
  GitBranch,
  ArrowUpRight,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  GitPullRequest,
  Play,
} from "lucide-react";
import Link from "next/link";
import { formatTime, formatMTTR } from "@/lib/utils";
import { triggerRun, fetchRepos } from "@/lib/api";
import { toast } from "@/lib/toast";

export default function RunsTable({ 
  runs, 
  onSelectRun, 
  isLoading,
  isDemo = false
}: { 
  runs: any[], 
  onSelectRun?: (run: any) => void,
  isLoading?: boolean,
  isDemo?: boolean
}) {
  const [isTriggering, setIsTriggering] = useState(false);

  const handleManualTrigger = async () => {
    setIsTriggering(true);
    try {
      const repos = await fetchRepos();
      if (repos.length === 0) {
        document.getElementById("add-repo-modal-trigger")?.click();
        return;
      }
      // Trigger first repo for now
      await triggerRun(repos[0].id, repos[0].branch);
      toast.success("Autonomous run queued successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to trigger run");
    } finally {
      setIsTriggering(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-48 bg-white/5 rounded animate-pulse" />
        <div className="h-[400px] w-full bg-white/5 rounded-2xl border border-white/5 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-5 duration-700">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2 text-white">
          <Activity size={16} className="text-acid" />
          Autonomous Run History
        </h2>
        <Link
          href="/runs"
          className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-acid flex items-center gap-2 transition-all group"
        >
          Detailed Archive
          <ArrowUpRight size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        </Link>
      </div>

      <div className="rounded-2xl border border-white/5 bg-[#080b12]/40 backdrop-blur-sm overflow-hidden relative">
        {isDemo && runs.length === 0 && (
          <div className="absolute top-0 right-0 z-50">
             <div className="bg-acid/20 text-acid text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-bl-xl border-l border-b border-white/10 backdrop-blur-md">
                Protocol Simulation Active
             </div>
          </div>
        )}

        {runs.length === 0 && !isDemo ? (
          <div className="p-20 text-center space-y-6 flex flex-col items-center justify-center">
            <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center border border-white/5 relative group">
              <div className="absolute inset-0 bg-acid/5 rounded-3xl blur-xl group-hover:bg-acid/10 transition-colors" />
              <Activity size={32} className="text-slate-700 group-hover:text-acid transition-colors duration-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Neural links inactive</h3>
              <p className="text-[11px] text-slate-500 max-w-[280px] mx-auto leading-relaxed font-medium">
                No autonomous cycles detected. Link a repository or manually initiate a repair protocol.
              </p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => document.getElementById("add-repo-modal-trigger")?.click()}
                className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-white text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Connect Repository
              </button>
              <button 
                onClick={handleManualTrigger}
                disabled={isTriggering}
                className="px-6 py-3 rounded-xl bg-acid text-void text-[10px] font-black uppercase tracking-widest hover:shadow-[0_0_20px_rgba(0,255,136,0.2)] transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isTriggering ? <Loader2 className="animate-spin" size={12} /> : <Play size={12} fill="currentColor" />}
                Trigger Manual Run
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Context / Target</th>
                  <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Mode</th>
                  <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">State</th>
                  <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Resol. Time</th>
                  <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center">Outcome</th>
                  <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(runs.length === 0 && isDemo ? [
                  { id: 'DEMO-001', repo: 'devcure/frontend-core', branch: 'main', run_type: 'push', status: 'completed', mttr_seconds: 245, pr_url: '#', created_at: new Date(Date.now() - 3600000).toISOString() },
                  { id: 'DEMO-002', repo: 'devcure/api-service', branch: 'v2-testing', run_type: 'manual', status: 'completed', mttr_seconds: 182, pr_url: '#', created_at: new Date(Date.now() - 7200000).toISOString() },
                  { id: 'DEMO-003', repo: 'devcure/auth-worker', branch: 'fix/tokens', run_type: 'push', status: 'completed', mttr_seconds: 940, pr_url: '#', created_at: new Date(Date.now() - 86400000).toISOString() },
                ] : runs).map((run: any) => (
                  <tr
                    key={run.id}
                    className={`hover:bg-white/5 transition-all group cursor-pointer ${isDemo && runs.length === 0 ? 'opacity-60 grayscale-[0.5]' : ''}`}
                    onClick={() => onSelectRun && onSelectRun(run)}
                  >
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-void border border-white/5 flex items-center justify-center group-hover:border-white/20 transition-all shadow-xl">
                          <FolderGit2 size={16} className="text-slate-400 group-hover:text-acid" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[13px] font-bold text-slate-100 group-hover:text-white transition-colors">
                            {run.repo}
                          </span>
                          <span className="text-[10px] text-slate-600 font-black uppercase tracking-tighter flex items-center gap-1.5">
                            <GitBranch size={10} className="text-slate-700" /> {run.branch}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <span className="px-3 py-1 rounded-lg bg-void border border-white/5 text-[9px] font-black text-slate-500 uppercase tracking-widest select-none">
                        {run.run_type}
                      </span>
                    </td>
                    <td className="p-5">
                      <StatusBadge status={run.status} />
                    </td>
                    <td className="p-5">
                      <span className="text-[11px] font-black text-slate-400 font-mono tracking-tighter">
                        {formatMTTR(run.mttr_seconds)}
                      </span>
                    </td>
                    <td className="p-5 text-center">
                      {run.pr_url ? (
                        <a
                          href={run.pr_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-acid/10 text-acid hover:bg-acid/20 border border-acid/10 transition-all group/pr shadow-lg shadow-acid/5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <GitPullRequest size={16} className="group-hover/pr:scale-110 transition-transform" />
                        </a>
                      ) : (
                        <div className="h-10 flex items-center justify-center">
                           <span className="text-slate-800 font-black text-[10px]">INCOMPLETE</span>
                        </div>
                      )}
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="text-[11px] font-bold text-slate-500">{formatTime(run.created_at)}</span>
                        <div className="text-[8px] font-black text-slate-700 uppercase tracking-widest">{run.id}</div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, any> = {
    completed: { color: "text-acid", bg: "bg-acid/10", icon: CheckCircle2, label: "Resolved", dot: "bg-acid" },
    escalated: { color: "text-plasma", bg: "bg-plasma/10", icon: XCircle, label: "Review", dot: "bg-plasma" },
    failed: { color: "text-red-500", bg: "bg-red-500/10", icon: XCircle, label: "Terminated", dot: "bg-red-500" },
    running: { color: "text-ice", bg: "bg-ice/10", icon: Loader2, label: "Active", dot: "bg-ice", pulse: true },
    queued: { color: "text-amber-500", bg: "bg-amber-500/10", icon: Clock, label: "Pending", dot: "bg-amber-500" },
  };
  const config = configs[status] || configs.queued;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-current/10 ${config.bg} ${config.color}`}>
      <div className="relative flex h-1.5 w-1.5">
        {config.pulse && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
        )}
        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${config.dot}`}></span>
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest leading-none">
        {config.label}
      </span>
    </div>
  );
}
