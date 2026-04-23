"use client";

import React, { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  Circle, 
  PlusCircle, 
  PlayCircle, 
  GitPullRequest,
  ArrowRight,
  Zap,
  Loader2
} from "lucide-react";
import { useOnboardingState } from "@/hooks/useOnboardingState";
import { trackConversion } from "@/lib/ab-testing";
import { getAnonymousId } from "@/lib/anonymous-id";
import Link from "next/link";
import AddRepoModal from "@/components/AddRepoModal";
import { triggerDemoRun } from "@/lib/api";
import { toast } from "@/lib/toast";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const { steps, allComplete, loading } = useOnboardingState();
  const [activeStep, setActiveStep] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);
  const router = useRouter();

  const handleDemoTrigger = async () => {
    setIsTriggering(true);
    try {
      await triggerDemoRun();
      toast.success("Identity synchronized. Entering dashboard...");
      router.push("/dashboard");
    } catch (err) {
      toast.error("Failed to trigger demo run. Please try again.");
    } finally {
      setIsTriggering(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    // Track conversion if they land here and are somehow already complete
    if (allComplete) {
      trackConversion('onboarding-flow-v1', 'B', getAnonymousId(), 'onboarding_complete');
    }
  }, [allComplete]);

  // Determine current active step based on progress
  useEffect(() => {
    if (steps.pr) setActiveStep(4);
    else if (steps.run) setActiveStep(3);
    else if (steps.repo) setActiveStep(2);
    else if (steps.github) setActiveStep(1);
    else setActiveStep(0);
  }, [steps]);

  if (!mounted || loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-void">
        <Loader2 className="w-8 h-8 text-acid animate-spin" />
      </div>
    );
  }

  const onboardingSteps = [
    {
      id: "github",
      title: "Identity Gateway",
      description: "Securely link your development identity to the autonomous engine.",
      icon: Zap,
      completed: steps.github,
      action: "Connect GitHub",
      href: "/login" // Usually triggers OAuth
    },
    {
      id: "repo",
      title: "Neural Mapping",
      description: "Connect your first repository to allow the AI to scan for failures.",
      icon: PlusCircle,
      completed: steps.repo,
      action: "Connect Repository",
      onClick: () => setIsModalOpen(true)
    },
    {
      id: "run",
      title: "Execution Cycle",
      description: "Trigger an autonomous repair run by pushing a failing test.",
      icon: PlayCircle,
      completed: steps.run,
      action: "Instant Start (Demo)",
      onClick: handleDemoTrigger
    },
    {
      id: "pr",
      title: "Final Resolution",
      description: "Review and merge your first AI-generated surgical patch.",
      icon: GitPullRequest,
      completed: steps.pr,
      action: "Review PR",
      href: "/dashboard"
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-void flex flex-col items-center py-20 px-6">
      <div className="max-w-2xl w-full space-y-12">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-acid/20 bg-acid/5 text-[10px] font-black uppercase tracking-[0.3em] text-acid">
            Activation Protocol Initialized
          </div>
          <h1 className="text-5xl font-black tracking-tight text-white">Activate DevCure</h1>
          <p className="text-slate-500 text-lg">Complete the sequence to initialize the autonomous repair agent.</p>
        </div>

        <div className="space-y-4">
          {onboardingSteps.map((step, idx) => (
            <div 
                key={step.id}
                className={`relative group p-6 rounded-2xl border transition-all duration-500 ${
                  idx === activeStep 
                    ? "bg-white/5 border-white/20 shadow-2xl shadow-acid/5" 
                    : step.completed 
                      ? "bg-acid/5 border-acid/10 opacity-70" 
                      : "bg-void border-white/5 opacity-40 grayscale"
                }`}
            >
              <div className="flex items-center gap-6">
                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center border transition-all duration-500 ${
                  idx === activeStep ? "bg-acid border-acid text-void" : "bg-white/5 border-white/10 text-slate-500"
                }`}>
                  {step.completed ? <CheckCircle2 size={24} /> : <step.icon size={24} />}
                </div>
                
                <div className="flex-1 space-y-1">
                  <h3 className="text-white font-bold text-lg leading-none">{step.title}</h3>
                  <p className="text-slate-500 text-sm">{step.description}</p>
                </div>

                {idx === activeStep && !step.completed && (
                  step.onClick ? (
                    <button 
                      disabled={isTriggering}
                      onClick={step.onClick}
                      className="px-6 py-3 bg-acid text-void rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:scale-100"
                    >
                      {isTriggering && step.id === "run" ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          {step.action}
                          <ArrowRight size={14} />
                        </>
                      )}
                    </button>
                  ) : (
                    <Link
                      href={step.href || "#"}
                      className="px-6 py-3 bg-acid text-void rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                    >
                      {step.action}
                      <ArrowRight size={14} />
                    </Link>
                  )
                )}
              </div>
            </div>
          ))}
        </div>

        {allComplete && (
          <div className="p-8 rounded-2xl bg-gradient-to-br from-acid/10 to-plasma/10 border border-acid/20 text-center space-y-6 animate-in zoom-in-95 duration-700">
             <div className="h-16 w-16 bg-acid rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-acid/40">
                <CheckCircle2 size={32} className="text-void" />
             </div>
             <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">Protocol Complete</h2>
                <p className="text-slate-400">The autonomous agent is now fully synchronized with your workspace.</p>
             </div>
             <Link 
                href="/dashboard"
                className="inline-flex px-10 py-4 bg-acid text-void rounded-xl text-sm font-black uppercase tracking-[0.2em] hover:scale-105 transition-all"
             >
               Enter Dashboard
             </Link>
          </div>
        )}
      </div>
      <AddRepoModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={async (config) => {
           const { createRepo } = await import("@/lib/api");
           await createRepo({ ...config, auto_repair: true });
           setIsModalOpen(false);
        }}
      />
    </div>
  );
}
