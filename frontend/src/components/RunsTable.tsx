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
  Terminal,
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Terminal size={18} className="text-[#0891B2]" />
          <h2 className="text-[12px] font-black text-white uppercase tracking-[0.4em] font-display">Autonomous_Cycles</h2>
        </div>
        <Link
          href="/runs"
          className="text-[11px] font-black text-zinc-500 hover:text-white flex items-center gap-2 transition-all group font-display tracking-widest"
        >
          VIEW_ARCHIVE
          <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        </Link>
      </div>

      <div className="rounded-[32px] border border-white/5 bg-zinc-950/40 backdrop-blur-2xl overflow-hidden shadow-2xl">
        {runs.length === 0 && !isDemo ? (
          <div className="p-24 text-center flex flex-col items-center justify-center">
            <div className="w-20 h-20 rounded-3xl bg-zinc-900/50 flex items-center justify-center border border-white/5 mb-8 group-hover:border-[#0891B2]/30 transition-all">
              <Activity size={32} className="text-zinc-700" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3 font-display">No active neural links</h3>
            <p className="text-sm text-zinc-500 max-w-xs mx-auto leading-relaxed mb-10 font-medium">
              Initialize your first autonomous probe to begin codebase infrastructure monitoring.
            </p>
            <button 
              onClick={handleManualTrigger}
              disabled={isTriggering}
              className="px-8 py-4 rounded-full bg-[#0891B2] text-black text-xs font-black uppercase tracking-[0.2em] hover:shadow-[0_0_40px_rgba(8,145,178,0.3)] transition-all disabled:opacity-50 flex items-center gap-3"
            >
              {isTriggering ? <Loader2 className="animate-spin" size={16} /> : <Play size={16} fill="currentColor" />}
              Initialize Cycle_0
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="p-6 pl-8 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] font-display">Repository</th>
                  <th className="p-6 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] font-display">Protocol</th>
                  <th className="p-6 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] font-display">Status</th>
                  <th className="p-6 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] font-display text-center">MTTR</th>
                  <th className="p-6 pr-8 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] font-display text-right">Manifest</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(runs.length === 0 && isDemo ? [
                  { id: 'R-7721', repo: 'web-gateway', branch: 'main', run_type: 'PUSH', status: 'completed', mttr_seconds: 245, created_at: new Date(Date.now() - 3600000).toISOString() },
                  { id: 'R-7722', repo: 'auth-worker', branch: 'stable', run_type: 'SCAN', status: 'completed', mttr_seconds: 182, created_at: new Date(Date.now() - 7200000).toISOString() },
                ] : runs).map((run: any) => (
                  <tr
                    key={run.id}
                    className={`hover:bg-white/[0.04] transition-all cursor-pointer group relative ${
                      run.status === 'escalated' ? 'bg-amber-500/[0.03] border-l-2 border-l-amber-500/50' : ''
                    }`}
                    onClick={() => onSelectRun && onSelectRun(run)}
                  >
                    <td className="p-6 pl-8">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center group-hover:border-[#0891B2]/40 transition-all relative overflow-hidden">
                          <FolderGit2 size={18} className="text-zinc-600 group-hover:text-[#0891B2] relative z-10 transition-colors" />
                          <div className="absolute inset-0 bg-[#0891B2]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[13px] font-bold text-zinc-100 font-display tracking-tight">{run.repo}</span>
                          <span className="text-[10px] text-zinc-600 flex items-center gap-1 font-mono">
                            <GitBranch size={10} /> {run.branch}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className="text-[10px] font-black text-[#0891B2] px-2 py-1 rounded-lg bg-[#0891B2]/10 border border-[#0891B2]/20 font-mono tracking-tighter">
                        {run.run_type}
                      </span>
                    </td>
                    <td className="p-6">
                      <StatusBadge status={run.status} />
                    </td>
                    <td className="p-6 text-center">
                      <span className="text-xs font-bold font-mono text-zinc-400">{formatMTTR(run.mttr_seconds)}</span>
                    </td>
                    <td className="p-6 pr-8 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-bold text-zinc-300 font-mono">{formatTime(run.created_at)}</span>
                        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">ID:{run.id}</span>
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
    completed: { color: "text-emerald-500", label: "RESOLVED", dot: "bg-emerald-500", shadow: "shadow-[0_0_10px_#10b981]", bg: "bg-emerald-500/5" },
    escalated: { color: "text-amber-500", label: "NEEDS REVIEW", dot: "bg-amber-500", shadow: "shadow-[0_0_12px_#f59e0b]", bg: "bg-amber-500/10", pulse: true },
    failed: { color: "text-rose-500", label: "ABORTED", dot: "bg-rose-500", shadow: "shadow-[0_0_8px_#f43f5e]", bg: "bg-rose-500/5" },
    running: { color: "text-[#0891B2]", label: "EXECUTING", dot: "bg-[#0891B2]", shadow: "shadow-[0_0_10px_#0891B2]", bg: "bg-[#0891B2]/5", pulse: true },
    queued: { color: "text-zinc-500", label: "STAGING", dot: "bg-zinc-600", shadow: "", bg: "bg-zinc-900/50" },
  };
  const config = configs[status] || configs.queued;

  return (
    <div className={`inline-flex items-center gap-2.5 px-3 py-1 rounded-full border border-current/10 ${config.bg} ${config.color}`}>
      <div className="relative flex h-2 w-2">
        {config.pulse && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-40"></span>
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dot} ${config.shadow}`}></span>
      </div>
      <span className="text-[9px] font-black uppercase tracking-[0.2em] font-display">{config.label}</span>
    </div>
  );
}
