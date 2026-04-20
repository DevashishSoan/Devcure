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
      toast.info("No autonomous PRs yet. Trigger a run on a failing repo first.");
    }
  };

  const steps = [
    {
      id: "github",
      title: "Connect your GitHub account",
      completed: stepState.github,
      action: "Connect GitHub",
      onClick: handleGithubConnect,
      icon: GithubIcon
    },
    {
      id: "repo",
      title: "Add your first repository",
      completed: stepState.repo,
      action: "Add Repository",
      onClick: () => document.getElementById("add-repo-modal-trigger")?.click(),
      icon: PlusCircle
    },
    {
      id: "run",
      title: "Trigger your first run",
      completed: stepState.run,
      action: "View Guide",
      onClick: () => setShowGuide(true),
      icon: PlayCircle
    },
    {
      id: "pr",
      title: "Review your autonomous PR",
      completed: stepState.pr,
      action: "Review Fixes",
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
    <div className={`relative mb-8 rounded-2xl border border-white/10 bg-[#080b12]/60 backdrop-blur-xl transition-all duration-500 overflow-hidden ${isCollapsed ? 'p-4' : 'p-8'}`}>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-acid via-plasma to-ice opacity-30" />
      
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-acid flex items-center gap-2 mb-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-acid opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-acid"></span>
            </span>
            Activation Protocol
          </h2>
          {!isCollapsed && (
            <p className="text-xs text-slate-500 mt-2">Complete these steps to unlock full autonomous QA capabilities.</p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-white/5 rounded-lg text-slate-500 transition-colors"
          >
            {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </button>
          {(allComplete && !isCollapsed) && (
            <button 
              onClick={handleDismiss}
              className="p-2 hover:bg-white/5 rounded-lg text-slate-500 transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {!isCollapsed && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {steps.map((step) => (
            <div 
              key={step.id}
              className={`group flex flex-col gap-4 p-5 rounded-xl border transition-all duration-300 ${
                step.completed 
                  ? "bg-acid/5 border-acid/20 ring-1 ring-acid/5" 
                  : "bg-void/40 border-white/5 hover:border-white/10"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${step.completed ? "bg-acid/10 text-acid" : "bg-white/5 text-slate-500"}`}>
                  <step.icon size={18} />
                </div>
                {step.completed ? (
                  <div className="flex items-center gap-1.5 bg-acid/20 text-acid text-[9px] font-black uppercase tracking-tighter px-2 py-1 rounded-full">
                    <CheckCircle2 size={10} />
                    Done
                  </div>
                ) : (
                  <div className="h-5 w-5 rounded-full border border-white/10 flex items-center justify-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-white/10" />
                  </div>
                )}
              </div>
              
              <div className="space-y-1">
                <h3 className={`text-[11px] font-bold leading-tight ${step.completed ? "text-white" : "text-slate-400"}`}>
                  {step.title}
                </h3>
              </div>

              {!step.completed ? (
                <button 
                  onClick={step.onClick}
                  className="group/btn mt-auto py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest text-white transition-all flex items-center justify-center gap-2"
                >
                  {step.action}
                  <ExternalLink size={10} className="text-slate-500 group-hover/btn:text-acid group-hover/btn:translate-x-0.5 transition-all" />
                </button>
              ) : (
                <div className="mt-auto h-9 flex items-center">
                   <div className="h-px w-full bg-acid/10" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-void/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div 
            className="relative w-full max-w-xl bg-[#0c1017] border border-white/10 rounded-2xl shadow-2xl shadow-acid/5 animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]"
          >
            {/* Header - Fixed */}
            <div className="p-8 pb-0 shrink-0">
              <button 
                onClick={() => setShowGuide(false)}
                className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-lg text-slate-500 transition-colors z-10"
              >
                <X size={20} />
              </button>

              <div className="mb-6">
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-acid mb-2">Activation Guide</h2>
                <h3 className="text-2xl font-bold text-white tracking-tight">⚡ Trigger Your First Run</h3>
              </div>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
              <div className="space-y-8 text-sm text-slate-400">
                <p className="text-slate-300 leading-relaxed">
                  Follow these steps to activate DevCure's autonomous repair loop. This process typically takes less than 60 seconds.
                </p>
                
                <div className="space-y-6">
                  <div className="flex gap-5 group">
                    <div className="flex-none h-8 w-8 rounded-xl bg-acid/10 border border-acid/20 flex items-center justify-center text-[11px] font-black text-acid group-hover:bg-acid group-hover:text-void transition-all duration-300">1</div>
                    <div>
                      <p className="text-white font-bold mb-1.5 text-base tracking-tight">Connect a Repository</p>
                      <p className="leading-relaxed">Navigate to the <span className="text-slate-200 font-medium italic">Repositories</span> tab and register the target repo. Ensure the webhook secret matches your environment config.</p>
                    </div>
                  </div>

                  <div className="flex gap-5 group">
                    <div className="flex-none h-8 w-8 rounded-xl bg-acid/10 border border-acid/20 flex items-center justify-center text-[11px] font-black text-acid group-hover:bg-acid group-hover:text-void transition-all duration-300">2</div>
                    <div>
                      <p className="text-white font-bold mb-1.5 text-base tracking-tight">Stage a Failing Test</p>
                      <p className="leading-relaxed">In your local repository, create a test that is guaranteed to fail. This is necessary for the AI to detect a baseline "broken" state.</p>
                      <div className="mt-3 p-3 rounded-lg bg-void/50 border border-white/5 font-mono text-[10px] text-acid/80">
                        def test_failure(): assert 1 == 2
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-5 group">
                    <div className="flex-none h-8 w-8 rounded-xl bg-acid/10 border border-acid/20 flex items-center justify-center text-[11px] font-black text-acid group-hover:bg-acid group-hover:text-void transition-all duration-300">3</div>
                    <div>
                      <p className="text-white font-bold mb-1.5 text-base tracking-tight">Push to GitHub</p>
                      <p className="leading-relaxed">Commit and push your change. DevCure will immediately intercept the push and begin the repair cycle.</p>
                    </div>
                  </div>

                  <div className="flex gap-5 group">
                    <div className="flex-none h-8 w-8 rounded-xl bg-acid/10 border border-acid/20 flex items-center justify-center text-[11px] font-black text-acid group-hover:bg-acid group-hover:text-void transition-all duration-300">4</div>
                    <div>
                      <p className="text-white font-bold mb-1.5 text-base tracking-tight">Monitor Resolution</p>
                      <p className="leading-relaxed">Switch to the <span className="text-slate-200 font-medium italic">Autonomous Runs</span> tab. You'll see the AI live-diagnosing the issue and drafting a surgical patch.</p>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setShowGuide(false)}
                className="w-full mt-8 py-4 rounded-xl bg-acid text-void text-xs font-black uppercase tracking-[0.2em] hover:bg-white hover:text-void hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-xl shadow-acid/10"
              >
                Initialize Protocol
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
