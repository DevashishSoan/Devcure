"use client";

import React, { useState } from "react";
import { X, GitBranch, Loader2, Zap } from "lucide-react";
import { GithubIcon as Github } from "./landing/Icons";

interface AddRepoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (config: { repo_url: string; branch: string; max_iterations: number }) => Promise<void>;
}

export default function AddRepoModal({ isOpen, onClose, onAdd }: AddRepoModalProps) {
  const [formData, setFormData] = useState({
    repo_url: "",
    branch: "main",
    max_iterations: 5
  });
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onAdd(formData);
      onClose();
      setFormData({ repo_url: "", branch: "main", max_iterations: 5 });
    } catch (err) {
      // Error handled by hook
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-void/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-[#080b12] border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Glow Background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-acid/5 rounded-full -mr-32 -mt-32 blur-[80px]" />
        
        <div className="flex items-center justify-between mb-8 relative">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-acid/10 text-acid border border-acid/10">
              <Github size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Connect Repository</h2>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-black">Authentication Protocol α</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/5 text-slate-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Clone URL</label>
            <input 
              required
              type="url"
              placeholder="https://github.com/username/repo"
              value={formData.repo_url}
              onChange={(e) => setFormData({...formData, repo_url: e.target.value})}
              className="w-full bg-void border border-white/5 rounded-xl py-4 px-5 text-sm font-mono text-acid placeholder:text-slate-800 focus:outline-none focus:border-acid/30 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Target Branch</label>
              <div className="relative">
                <GitBranch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                <input 
                  required
                  type="text"
                  placeholder="main"
                  value={formData.branch}
                  onChange={(e) => setFormData({...formData, branch: e.target.value})}
                  className="w-full bg-void border border-white/5 rounded-xl py-4 pl-12 pr-5 text-sm font-mono text-white focus:outline-none focus:border-acid/30 transition-all"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Iteration Limit</label>
              <input 
                required
                type="number"
                min="1"
                max="20"
                value={formData.max_iterations}
                onChange={(e) => setFormData({...formData, max_iterations: parseInt(e.target.value)})}
                className="w-full bg-void border border-white/5 rounded-xl py-4 px-5 text-sm font-mono text-white focus:outline-none focus:border-acid/30 transition-all"
              />
            </div>
          </div>

          <div className="pt-4 flex flex-col gap-4">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
              <Zap size={16} className="text-acid animate-pulse" />
              <p className="text-[10px] text-slate-500 font-medium">
                Autonomous Auto-Repair β will be enabled by default. The agent will automatically detect and repair failed CI tests.
              </p>
            </div>

            <button 
              type="submit"
              disabled={submitting}
              className="w-full py-5 rounded-2xl bg-acid text-void font-black uppercase tracking-[0.3em] text-xs hover:shadow-[0_0_40px_rgba(0,255,136,0.3)] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="animate-spin" size={18} /> : <span>Establish Connection</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
