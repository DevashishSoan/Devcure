"use client";

import React, { useState } from "react";
import { 
  FolderGit2, 
  Plus, 
  GitBranch, 
  ExternalLink, 
  Trash2, 
  Loader2, 
  Shield,
  Zap,
  Radio,
} from "lucide-react";
import { motion } from "framer-motion";
import { useRepos, Repository } from "@/hooks/useRepos";
import AddRepoModal from "@/components/AddRepoModal";

export default function ReposPage() {
  const { repos, loading, addRepo, removeRepo } = useRepos();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#020617]">
        <div className="relative">
           <div className="absolute inset-0 bg-[#0891B2]/20 blur-3xl rounded-full animate-pulse" />
           <Loader2 className="animate-spin text-[#0891B2] relative" size={32} />
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 flex flex-col overflow-hidden bg-[#020617] relative">
      {/* Architectural Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      
      {/* Cinematic Glares */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#0891B2]/5 rounded-full -mr-96 -mt-96 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#0891B2]/5 rounded-full -ml-72 -mb-72 blur-[100px] pointer-events-none" />

      <header className="h-24 border-b border-white/5 bg-[#020617]/40 backdrop-blur-3xl px-10 flex items-center justify-between shrink-0 relative z-10">
          <div className="space-y-1">
            <h1 className="text-2xl font-medium text-white tracking-tight flex items-center gap-3 font-display">
              Repository Network
              <div className="p-1.5 rounded-lg bg-[#0891B2]/10 border border-[#0891B2]/20 shadow-[0_0_10px_#0891B233]">
                <Shield className="text-[#0891B2]" size={18} />
              </div>
            </h1>
            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em]">Active Control Plane Configurations</p>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-3 px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-[11px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all font-display"
          >
            <Plus size={14} />
            Initialize Protocol
          </button>
        </header>

        <section className="flex-1 overflow-y-auto p-10 space-y-12 relative z-10 custom-scrollbar">
          {repos.length === 0 ? (
             <EmptyState onOpen={() => setIsModalOpen(true)} />
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
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
  const { triggerRun, isTriggering } = useRepos();
  const triggering = isTriggering === repo.id;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-8 rounded-[32px] border border-white/5 bg-zinc-950/60 backdrop-blur-2xl hover:border-[#0891B2]/30 transition-all group relative overflow-hidden shadow-2xl"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#0891B2]/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex items-start justify-between relative">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-[24px] bg-zinc-900 border border-white/5 flex items-center justify-center group-hover:border-[#0891B2]/30 transition-all shadow-inner overflow-hidden relative">
            <FolderGit2 size={28} className="text-[#0891B2]/80 drop-shadow-[0_0_8px_#0891B266] relative z-10" />
            <div className="absolute inset-0 bg-[#0891B2]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold text-white tracking-tight font-display">{repo.repo_url.split('/').pop()}</h3>
              <div className="flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-zinc-900 border border-white/5">
                <div className={`w-1.5 h-1.5 rounded-full ${repo.enabled ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-zinc-700'}`} />
                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{repo.enabled ? "Active" : "Idle"}</span>
              </div>
            </div>
            <p className="text-[11px] text-zinc-500 font-mono flex items-center gap-2 hover:text-[#0891B2] transition-colors cursor-pointer truncate max-w-xs">
              <ExternalLink size={12} />
              {repo.repo_url}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-zinc-900 border border-white/5">
            <GitBranch size={14} className="text-zinc-600" />
            <span className="text-[11px] font-black font-mono text-zinc-400 uppercase tracking-tighter">{repo.branch}</span>
          </div>
          
          <div className="flex items-center gap-2">
             <button 
               onClick={() => triggerRun(repo.id, repo.branch)}
               disabled={triggering}
               className={`p-2.5 rounded-xl bg-white/5 border border-white/5 transition-all cursor-pointer ${
                 triggering ? 'text-[#0891B2] animate-pulse' : 'text-zinc-500 hover:text-white'
               }`}
             >
                {triggering ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
             </button>
             <button 
               onClick={onDelete}
               className="p-2.5 rounded-xl bg-rose-500/5 border border-rose-500/10 text-rose-500/40 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
             >
               <Trash2 size={18} />
             </button>
          </div>
        </div>
      </div>
      
      <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-zinc-900/40 border border-white/5 space-y-1">
             <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Inference Limit</p>
             <p className="text-sm font-bold text-white font-mono">{repo.max_iterations} CYCLES</p>
          </div>
          <div className="p-5 rounded-2xl bg-zinc-900/40 border border-white/5 space-y-1">
             <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Protocol Type</p>
             <p className="text-sm font-bold text-white font-display tracking-tight">{repo.framework || "AUTO_DETECT"}</p>
          </div>
      </div>
    </motion.div>
  );
}

function EmptyState({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 space-y-12 text-center max-w-2xl mx-auto">
      {/* Holographic Radar centerpiece */}
      <div className="relative flex items-center justify-center w-64 h-64">
        {/* Animated Sonar Rings */}
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ scale: 0.5, opacity: 0.5 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              delay: i * 1,
              ease: "easeOut"
            }}
            className="absolute inset-0 border border-[#0891B2]/20 rounded-full"
          />
        ))}
        
        {/* Core Node */}
        <div className="relative w-24 h-24 rounded-full bg-[#0891B2]/5 border border-[#0891B2]/20 flex items-center justify-center shadow-[0_0_30px_#0891B211]">
           <motion.div 
             animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
             transition={{ duration: 4, repeat: Infinity }}
             className="absolute inset-0 bg-[#0891B2]/10 rounded-full blur-xl"
           />
           <Radio size={40} className="text-[#0891B2] relative z-10 animate-pulse" />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-3xl font-medium tracking-tight text-white font-display">No Active Nodes</h3>
        <p className="text-zinc-400 text-base max-w-md mx-auto leading-relaxed">
          Your repository network is currently offline. Connect your first node to initialize autonomous QA protocols.
        </p>
      </div>

      <button 
        onClick={onOpen}
        className="px-10 py-4 rounded-full bg-[#0891B2] text-black font-bold text-xs uppercase tracking-[0.2em] hover:shadow-[0_0_40px_rgba(8,145,178,0.4)] hover:scale-105 transition-all duration-300 backdrop-blur-md"
      >
        Establish Connection
      </button>
    </div>
  );
}
