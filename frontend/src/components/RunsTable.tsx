"use client";

import React from "react";
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
} from "lucide-react";
import Link from "next/link";

export default function RunsTable({ runs }: { runs: any[] }) {
  const formatTime = (isoString: string) => {
    const diff = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    return `${hours}h ago`;
  };

  const formatMTTR = (seconds: number | null) => {
    if (!seconds) return "—";
    return `${Math.floor(seconds / 60)}m ${Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0")}s`;
  };

  return (
    <div className="space-y-4 animate-fade-in" style={{ animationDelay: "300ms" }}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold flex items-center gap-2 text-white">
          <Activity size={18} className="text-blue-400" />
          Recent Autonomous Runs
        </h2>
        <Link
          href="/runs"
          className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 group transition-colors"
        >
          View All{" "}
          <ArrowUpRight
            size={12}
            className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
          />
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-800/40 bg-[#0a0f1e]/40 overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-800/40 bg-slate-900/30">
                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Repository
                </th>
                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Type
                </th>
                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Status
                </th>
                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  MTTR
                </th>
                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                  PR
                </th>
                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Errors
                </th>
                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/30">
              {runs.map((run: any, i: number) => (
                <tr
                  key={run.id}
                  className="hover:bg-slate-800/15 transition-colors group cursor-pointer"
                >
                  <td className="p-4">
                    <Link href={`/runs/${run.id}`} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-800/50 flex items-center justify-center group-hover:bg-slate-700/50 transition-colors">
                        <FolderGit2 size={14} className="text-slate-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-200">
                          {run.repo}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                          <GitBranch size={10} /> {run.branch}
                        </span>
                      </div>
                    </Link>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-800/50 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      {run.run_type}
                    </span>
                  </td>
                  <td className="p-4">
                    <StatusBadge status={run.status} />
                  </td>
                  <td className="p-4">
                    <span className="text-sm font-medium text-slate-400 font-mono">
                      {formatMTTR(run.mttr_seconds)}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    {run.pr_url ? (
                      <a
                        href={run.pr_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                        title="View Pull Request"
                      >
                        <GitPullRequest size={14} />
                      </a>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1 flex-wrap">
                      {run.error_classes?.length > 0 ? (
                        run.error_classes.map((ec: string, j: number) => (
                          <span
                            key={j}
                            className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/10"
                          >
                            {ec}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-slate-600">—</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <span className="text-xs text-slate-500">{formatTime(run.created_at)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const configs: Record<
    string,
    { color: string; bg: string; icon: any; label: string; animate?: string }
  > = {
    completed: {
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      icon: CheckCircle2,
      label: "Resolved",
    },
    failed: {
      color: "text-red-400",
      bg: "bg-red-500/10",
      icon: XCircle,
      label: "Escalated",
    },
    running: {
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      icon: Loader2,
      label: "Repairing",
      animate: "animate-spin",
    },
    queued: {
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      icon: Clock,
      label: "Queued",
    },
  };
  const config = configs[status] || configs.queued;
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${config.bg} ${config.color}`}
    >
      <Icon size={13} className={config.animate} />
      <span className="text-[11px] font-bold leading-none">{config.label}</span>
    </div>
  );
}
