"use client";

import React from "react";
import { X, Zap, Shield, Search, Cpu, Activity, ArrowRight } from "lucide-react";

interface AIStrategyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AIStrategyModal({ isOpen, onClose }: AIStrategyModalProps) {
  if (!isOpen) return null;

  const protocolSteps = [
    {
      icon: Search,
      title: "Contextual Osmosis",
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      description: "The agent builds a multi-dimensional map of your repository's dependency graph, local symbols, and test history."
    },
    {
      icon: Activity,
      title: "Heuristic Diagnosis",
      color: "text-indigo-400",
      bg: "bg-indigo-400/10",
      description: "Neural models analyze stack traces and log deltas to pinpoint the 'Zero-Point' of a logic failure."
    },
    {
      icon: Cpu,
      title: "Surgical Synthesis",
      color: "text-sky-400",
      bg: "bg-sky-400/10",
      description: "Using the selected LLM Brain (Gemini/MiniMax/Gemma), the system drafts a minimal, high-precision unified diff."
    },
    {
      icon: Shield,
      title: "Safety Gate Protocol",
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
      description: "The patch is executed in an isolated sandbox. If tests don't pass 100%, the cycle increments and repairs its own fix."
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-[#09090b]/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div 
        className="relative w-full max-w-2xl bg-zinc-900 border border-white/[0.05] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
      >
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 rounded-full -mr-32 -mt-32 blur-[80px]" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full -ml-32 -mb-32 blur-[80px]" />

        <div className="relative p-8 md:p-10">
          <button 
            onClick={onClose}
            className="absolute top-8 right-8 p-2 hover:bg-white/[0.05] rounded-full text-zinc-500 transition-colors"
          >
            <X size={20} />
          </button>

          <div className="mb-10">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={16} className="text-sky-400 fill-sky-400/20" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-sky-400">Tactical Overview</span>
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight font-display">Neural Resolution Protocol</h2>
            <p className="mt-3 text-zinc-500 text-sm leading-relaxed max-w-lg font-medium">
              DevCure uses a recursive LangGraph architecture to move beyond simple 'AI coding' and into autonomous engineering.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {protocolSteps.map((step, idx) => (
              <div key={idx} className="group p-5 rounded-2xl bg-zinc-950/50 border border-white/[0.03] hover:border-white/[0.1] transition-all hover:-translate-y-1">
                <div className={`h-10 w-10 rounded-xl ${step.bg} ${step.color} flex items-center justify-center mb-4 border border-white/[0.02]`}>
                  <step.icon size={20} />
                </div>
                <h4 className="text-[13px] font-bold text-zinc-100 mb-1.5">{step.title}</h4>
                <p className="text-[12px] text-zinc-500 leading-relaxed font-medium">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 pt-8 border-t border-white/[0.05] flex items-center justify-between">
             <div className="space-y-1">
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">System Trust Score</p>
                <div className="flex items-center gap-2">
                   <div className="h-1.5 w-32 rounded-full bg-zinc-800 overflow-hidden">
                      <div className="h-full w-[94%] bg-gradient-to-r from-sky-400 to-indigo-500" />
                   </div>
                   <span className="text-[10px] font-bold text-zinc-300">94.8%</span>
                </div>
             </div>
             
             <button 
                onClick={onClose}
                className="flex items-center gap-2 text-xs font-bold text-sky-400 hover:text-white transition-colors group"
             >
                Acknowledge Strategy
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
