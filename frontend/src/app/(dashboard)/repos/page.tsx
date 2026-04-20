"use client";

import React, { useState } from "react";
import { 
  FolderGit2, 
  Plus, 
  GitBranch, 
  ExternalLink, 
  Trash2, 
  Loader2, 
  LayoutGrid,
  ShieldCheck,
  Zap
} from "lucide-react";
import { useRepos, Repository } from "@/hooks/useRepos";
import AddRepoModal from "@/components/AddRepoModal";

export default function ReposPage() {
  const { repos, loading, addRepo, removeRepo } = useRepos();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-void">
        <div className="relative">
           <div className="absolute inset-0 bg-acid/20 blur-3xl rounded-full animate-pulse" />
           <Loader2 className="animate-spin text-acid relative" size={32} />
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 flex flex-col overflow-hidden bg-void relative">
      {/* Dynamic Background */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-acid/5 rounded-full -mr-96 -mt-96 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-plasma/5 rounded-full -ml-72 -mb-72 blur-[100px] pointer-events-none" />

      <header className="h-24 border-b border-white/5 bg-void/40 backdrop-blur-3xl px-10 flex items-center justify-between shrink-0 relative z-10">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
              Repository Network
              <ShieldCheck className="text-acid" size={20} />
            </h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Active Control Plane Configurations</p>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-acid text-void text-xs font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(0,255,136,0.2)] hover:shadow-[0_0_40px_rgba(0,255,136,0.4)] hover:scale-[1.02] transition-all active:scale-95"
          >
            <Plus size={16} />
            Initialize Protocol
          </button>
        </header>

        <section className="flex-1 overflow-y-auto p-10 space-y-12 relative z-10 custom-scrollbar">
          {repos.length === 0 ? (
             <EmptyState onOpen={() => setIsModalOpen(true)} />
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {repos.map((repo) => (
                <RepoCard key={repo.id} repo={repo} onDelete={() => removeRepo(repo.id)} />
              ))}
            </div>
          )}
        </section>

        <AddRepoModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onAdd={addRepo} 
        />
      </main>
  );
}

function RepoCard({ repo, onDelete }: { repo: Repository, onDelete: () => void }) {
  return (
    <div className="p-8 rounded-[32px] border border-white/5 bg-[#080b12]/60 hover:bg-[#0c111c]/80 hover:border-acid/20 transition-all group relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-acid/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex items-start justify-between relative">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-[24px] bg-void border border-white/5 flex items-center justify-center group-hover:border-acid/30 transition-all shadow-inner">
            <FolderGit2 size={28} className="text-acid/80 drop-shadow-[0_0_8px_rgba(0,255,136,0.4)]" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-black text-white tracking-tight">{repo.repo_url.split('/').pop()}</h3>
              <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border ${
                repo.enabled ? "bg-acid/10 text-acid border-acid/20" : "bg-slate-800/40 text-slate-500 border-white/5"
              }`}>
                {repo.enabled ? "Online" : "Paused"}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono flex items-center gap-2 hover:text-acid/60 transition-colors cursor-pointer">
              <ExternalLink size={12} />
              {repo.repo_url}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-void border border-white/5">
            <GitBranch size={14} className="text-slate-600" />
            <span className="text-[11px] font-black font-mono text-slate-400">{repo.branch}</span>
          </div>
          
          <div className="flex items-center gap-2">
             <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5 text-slate-600 hover:text-white transition-all cursor-pointer">
                <Zap size={16} />
             </div>
             <button 
               onClick={onDelete}
               className="p-3 rounded-xl bg-red-500/5 border border-red-500/10 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/30 transition-all active:scale-90"
             >
               <Trash2 size={18} />
             </button>
          </div>
        </div>
      </div>
      
      <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-void/40 border border-white/5 space-y-1">
             <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Inference Limit</p>
             <p className="text-sm font-black text-white uppercase tracking-tight">{repo.max_iterations} Iterations</p>
          </div>
          <div className="p-4 rounded-2xl bg-void/40 border border-white/5 space-y-1">
             <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Protocol Type</p>
             <p className="text-sm font-black text-white uppercase tracking-tight">{repo.framework || "Auto-Detect"}</p>
          </div>
      </div>
    </div>
  );
}

function EmptyState({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 space-y-8 text-center max-w-md mx-auto">
      <div className="w-24 h-24 rounded-[32px] bg-acid/5 border border-acid/10 flex items-center justify-center relative">
        <div className="absolute inset-0 bg-acid/10 blur-2xl rounded-full animate-pulse" />
        <LayoutGrid size={40} className="text-acid relative" />
      </div>
      <div className="space-y-3">
        <h3 className="text-2xl font-black text-white uppercase tracking-tighter">No Active Nodes</h3>
        <p className="text-sm text-slate-500 leading-relaxed">
          Your repository network is currently offline. Connect your first node to initialize autonomous QA protocols.
        </p>
      </div>
      <button 
        onClick={onOpen}
        className="px-8 py-4 rounded-2xl bg-acid/10 border border-acid/20 text-acid text-xs font-black uppercase tracking-[0.2em] hover:bg-acid hover:text-void transition-all shadow-[0_0_20px_rgba(0,255,136,0.1)] hover:shadow-[0_0_40px_rgba(0,255,136,0.3)]"
      >
        Establish Connection
      </button>
    </div>
  );
}
