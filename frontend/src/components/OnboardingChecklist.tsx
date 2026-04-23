"use client";

import React, { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  Circle, 
  PlusCircle, 
  PlayCircle, 
  GitPullRequest,
  X,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from "lucide-react";
import { supabase } from "@/lib/api";
import { useOnboardingState } from "@/hooks/useOnboardingState";
import { toast } from "@/lib/toast";

const GithubIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

export default function OnboardingChecklist() {
  const { steps: stepState, loading, allComplete } = useOnboardingState();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const dismissed = localStorage.getItem("devcure_onboarding_dismissed") === "true";
    setIsDismissed(dismissed);
  }, []);

  const handleGithubConnect = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ 
      provider: "github", 
      options: { 
        scopes: "repo workflow",
        redirectTo: window.location.origin + "/auth/callback" 
      } 
    });
    if (error) toast.error("GitHub connection failed: " + error.message);
  };

  const handleReviewPR = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    
    const { data } = await supabase
      .from("runs")
      .select("pr_url")
      .eq("user_id", session.user.id)
      .not("pr_url", "is", null)
      .order("created_at", { ascending: false })
      .limit(1);

    if (data && data.length > 0 && data[0].pr_url) {
      window.open(data[0].pr_url, "_blank");
    } else {
      toast.info("No PRs available for review yet.");
    }
  };

  const steps = [
    {
      id: "github",
      title: "Identity Gateway",
      completed: stepState.github,
      action: "Connect GitHub",
      onClick: handleGithubConnect,
      icon: GithubIcon
    },
    {
      id: "repo",
      title: "Neural Mapping",
      completed: stepState.repo,
      action: "Add Repository",
      onClick: () => document.getElementById("add-repo-modal-trigger")?.click(),
      icon: PlusCircle
    },
    {
      id: "run",
      title: "Execution Cycle",
      completed: stepState.run,
      action: "Trigger Run",
      onClick: () => setShowGuide(true),
      icon: PlayCircle
    },
    {
      id: "pr",
      title: "Final Resolution",
      completed: stepState.pr,
      action: "Review Patch",
      onClick: handleReviewPR,
      icon: GitPullRequest
    }
  ];

  if (isDismissed || (stepState.repo && allComplete)) return null;
  if (!mounted || loading) return null;

  const handleDismiss = () => {
    localStorage.setItem("devcure_onboarding_dismissed", "true");
    setIsDismissed(true);
  };

  return (
    <div className={`relative mb-10 rounded-2xl border border-white/[0.05] bg-zinc-900/40 backdrop-blur-md transition-all duration-500 overflow-hidden ${isCollapsed ? 'p-4' : 'p-8'}`}>
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-500 opacity-40" />
      
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
             <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-400"></span>
              </span>
             <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-sky-400">Activation Protocol</h2>
          </div>
          {!isCollapsed && (
            <p className="text-[12px] text-zinc-500 font-medium">Complete these steps to unlock full autonomous QA capabilities.</p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 hover:bg-white/[0.03] rounded-lg text-zinc-600 transition-colors"
          >
            {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </button>
          {(allComplete && !isCollapsed) && (
            <button 
              onClick={handleDismiss}
              className="p-1.5 hover:bg-white/[0.03] rounded-lg text-zinc-600 transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {!isCollapsed && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
          {steps.map((step) => (
            <div 
              key={step.id}
              className={`flex flex-col gap-5 p-5 rounded-xl border transition-all duration-300 ${
                step.completed 
                  ? "bg-sky-500/5 border-sky-400/20" 
                  : "bg-zinc-900/50 border-white/[0.05] hover:border-white/[0.1]"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${step.completed ? "bg-sky-400/10 text-sky-400" : "bg-zinc-800 text-zinc-600"}`}>
                  <step.icon size={18} />
                </div>
                {step.completed ? (
                  <CheckCircle2 size={14} className="text-emerald-400" />
                ) : (
                  <Circle size={14} className="text-zinc-800" />
                )}
              </div>
              
              <h3 className={`text-[12px] font-semibold tracking-tight ${step.completed ? "text-zinc-100" : "text-zinc-400"}`}>
                {step.title}
              </h3>

              {!step.completed ? (
                <button 
                  onClick={step.onClick}
                  className="mt-auto py-2.5 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 text-[10px] font-bold uppercase tracking-wider text-white transition-all flex items-center justify-center gap-2 border border-white/[0.02]"
                >
                  {step.action}
                  <ExternalLink size={12} className="text-zinc-600" />
                </button>
              ) : (
                <div className="mt-auto h-9 flex items-center justify-center">
                   <span className="text-[9px] font-bold text-emerald-500/60 uppercase tracking-widest italic">Synchronized</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-zinc-950/90 backdrop-blur-lg animate-in fade-in duration-300">
          <div 
            className="relative w-full max-w-lg bg-[#18181b] border border-white/[0.05] rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh] overflow-hidden"
          >
            <div className="p-8 pb-0 flex items-center justify-between">
              <div>
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-sky-400 mb-2">Protocol Guide</h2>
                <h3 className="text-xl font-bold text-white tracking-tight font-display">Initialize First Cycle</h3>
              </div>
              <button 
                onClick={() => setShowGuide(false)}
                className="p-2 hover:bg-white/[0.03] rounded-full text-zinc-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
              <div className="space-y-6">
                {[
                  { n: "1", t: "Link Repository", d: "Connect your target codebase in the Repositories tab." },
                  { n: "2", t: "Simulate Failure", d: "Add a deliberate 'Broken' test to your codebase to trigger detection." },
                  { n: "3", t: "Push to Main", d: "DevCure will intercept the push and begin the repair cycle." },
                  { n: "4", t: "Monitor Solves", d: "Watch the AI draft surgical patches in the Autonomous Runs tab." }
                ].map((item) => (
                  <div key={item.n} className="flex gap-4 group">
                    <div className="flex-none h-7 w-7 rounded-lg bg-zinc-900 border border-white/[0.05] flex items-center justify-center text-[11px] font-bold text-sky-400 group-hover:bg-sky-500 group-hover:text-zinc-950 transition-all">
                      {item.n}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-100 mb-1 leading-none">{item.t}</p>
                      <p className="text-[12px] text-zinc-500 leading-relaxed font-medium">{item.d}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => setShowGuide(false)}
                className="w-full py-3.5 rounded-xl bg-sky-500 text-zinc-950 text-xs font-bold hover:bg-sky-400 transition-all shadow-lg shadow-sky-500/10 uppercase tracking-widest"
              >
                Enter Neural Control
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
