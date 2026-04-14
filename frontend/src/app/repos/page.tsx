"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { FolderGit2, Plus, GitBranch, ExternalLink, Trash2 } from "lucide-react";

export default function ReposPage() {
  const [repos] = useState([
    { id: 1, name: "frontend-app", url: "https://github.com/org/frontend-app", branch: "main", status: "Active" },
    { id: 2, name: "backend-api", url: "https://github.com/org/backend-api", branch: "develop", status: "Active" },
    { id: 3, name: "shared-core", url: "https://github.com/org/shared-core", branch: "main", status: "Paused" },
  ]);

  return (
    <div className="flex min-h-screen bg-[#020617] text-slate-200 font-[var(--font-inter)]">
      <Sidebar stats={null} />

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-slate-800/40 bg-[#020617]/60 backdrop-blur-xl px-8 flex items-center justify-between shrink-0">
          <h1 className="text-xl font-bold text-white">Repository Management</h1>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-600/20 transition-all">
            <Plus size={16} />
            Connect Repository
          </button>
        </header>

        <section className="flex-1 overflow-y-auto p-8 lg:p-10 space-y-8">
          <div className="grid grid-cols-1 gap-4">
            {repos.map((repo) => (
              <div key={repo.id} className="p-6 rounded-2xl border border-slate-800/40 bg-[#0a0f1e]/60 hover:border-slate-700/50 transition-all group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-800/50 flex items-center justify-center group-hover:bg-slate-800 transition-colors">
                      <FolderGit2 size={24} className="text-blue-400" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        {repo.name}
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                          repo.status === "Active" ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-700/30 text-slate-400"
                        }`}>
                          {repo.status}
                        </span>
                      </h3>
                      <p className="text-sm text-slate-500 flex items-center gap-1.5">
                        <ExternalLink size={12} />
                        {repo.url}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="px-4 py-2 rounded-xl bg-slate-800/40 border border-slate-700/30 flex items-center gap-2">
                      <GitBranch size={14} className="text-slate-500" />
                      <span className="text-sm font-mono text-slate-300">{repo.branch}</span>
                    </div>
                    <button className="p-2 text-slate-600 hover:text-red-400 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
