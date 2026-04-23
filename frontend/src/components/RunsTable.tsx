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
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal size={18} className="text-sky-400" />
          <h2 className="text-[13px] font-bold text-white uppercase tracking-widest">Autonomous Cycles</h2>
        </div>
        <Link
          href="/runs"
          className="text-[11px] font-semibold text-zinc-500 hover:text-white flex items-center gap-1.5 transition-all group"
        >
          View Full Archive
          <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        </Link>
      </div>

      <div className="rounded-2xl border border-white/[0.05] bg-[#18181b]/40 backdrop-blur-md overflow-hidden">
        {runs.length === 0 && !isDemo ? (
          <div className="p-20 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center border border-white/[0.05] mb-6">
              <Activity size={24} className="text-zinc-700" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-300 mb-2">No active neural links</h3>
            <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed mb-8">
              Connect your first repository to begin autonomous failure resolution.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={handleManualTrigger}
                disabled={isTriggering}
                className="px-6 py-2.5 rounded-lg bg-sky-500 text-zinc-950 text-xs font-bold hover:bg-sky-400 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-sky-500/10"
              >
                {isTriggering ? <Loader2 className="animate-spin" size={14} /> : <Play size={14} fill="currentColor" />}
                Initialize First Cycle
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-white/[0.05] bg-white/[0.01]">
                  <th className="p-4 pl-6 text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">Repository</th>
                  <th className="p-4 text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">Protocol</th>
                  <th className="p-4 text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">Status</th>
                  <th className="p-4 text-[11px] font-semibold text-zinc-500 uppercase tracking-widest text-center">MTTR</th>
                  <th className="p-4 pr-6 text-[11px] font-semibold text-zinc-500 uppercase tracking-widest text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {(runs.length === 0 && isDemo ? [
                  { id: 'R-7721', repo: 'web-gateway', branch: 'main', run_type: 'PUSH', status: 'completed', mttr_seconds: 245, created_at: new Date(Date.now() - 3600000).toISOString() },
                  { id: 'R-7722', repo: 'auth-worker', branch: 'stable', run_type: 'SCAN', status: 'completed', mttr_seconds: 182, created_at: new Date(Date.now() - 7200000).toISOString() },
                ] : runs).map((run: any) => (
                  <tr
                    key={run.id}
                    className="hover:bg-zinc-900/30 transition-colors cursor-pointer group"
                    onClick={() => onSelectRun && onSelectRun(run)}
                  >
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-white/[0.05] flex items-center justify-center group-hover:border-sky-500/30 transition-all">
                          <FolderGit2 size={16} className="text-zinc-500 group-hover:text-sky-400" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-zinc-100">{run.repo}</span>
                          <span className="text-[10px] text-zinc-600 flex items-center gap-1">
                            <GitBranch size={10} /> {run.branch}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-[10px] font-bold text-zinc-400 px-2 py-0.5 rounded bg-zinc-800/50 border border-white/[0.05]">
                        {run.run_type}
                      </span>
                    </td>
                    <td className="p-4">
                      <StatusBadge status={run.status} />
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-xs font-mono text-zinc-500">{formatMTTR(run.mttr_seconds)}</span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-medium text-zinc-400">{formatTime(run.created_at)}</span>
                        <span className="text-[9px] font-medium text-zinc-600 uppercase tracking-tighter">ID: {run.id}</span>
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
    completed: { color: "text-emerald-400", label: "Fixed", dot: "bg-emerald-500" },
    escalated: { color: "text-amber-400", label: "Review", dot: "bg-amber-500" },
    failed: { color: "text-rose-400", label: "Aborted", dot: "bg-rose-500" },
    running: { color: "text-sky-400", label: "Solving", dot: "bg-sky-500", pulse: true },
    queued: { color: "text-zinc-500", label: "Pending", dot: "bg-zinc-600" },
  };
  const config = configs[status] || configs.queued;

  return (
    <div className={`flex items-center gap-2 ${config.color}`}>
      <div className="relative flex h-1.5 w-1.5">
        {config.pulse && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
        )}
        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${config.dot}`}></span>
      </div>
      <span className="text-[11px] font-semibold uppercase tracking-widest">{config.label}</span>
    </div>
  );
}
