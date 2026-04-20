"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  RefreshCw,
  Bell,
  Activity,
  Zap,
} from "lucide-react";
import { supabase } from "@/lib/api";
import Sidebar from "@/components/Sidebar";
import StatsGrid from "@/components/StatsGrid";
import RunsTable from "@/components/RunsTable";
import OnboardingChecklist from "@/components/OnboardingChecklist";
import RunDetailModal from "@/components/RunDetailModal";
import AddRepoModal from "@/components/AddRepoModal";
import { useStats } from "@/hooks/useStats";
import { useRuns } from "@/hooks/useRuns";
import { useInsights } from "@/hooks/useInsights";
import { getVariant, trackABEvent } from "@/lib/ab-testing";
import { useOnboardingState } from "@/hooks/useOnboardingState";

export default function Dashboard() {
  const { runs, isLoading: runsLoading } = useRuns(10);
  const { stats, isLoading: statsLoading } = useStats();
  const insights = useInsights(runs);
  const { allComplete: onboardingFinished } = useOnboardingState();
  const [selectedRun, setSelectedRun] = useState<any | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => { 
    setMounted(true);

    async function checkVariant() {
       const { data: { session } } = await supabase.auth.getSession();
       if (!session) return;
       
       const v = getVariant('dashboard-empty-v1', session.user.id);
       setIsDemo(v === 'B' && !onboardingFinished);
       
       trackABEvent({
         experimentId: 'dashboard-empty-v1',
         variant: v,
         event: 'impression',
         userId: session.user.id,
         anonymousId: 'logged-in', // anonymous_id column allows null, but we track logged-in users specifically
         timestamp: new Date()
       });
    }
    
    checkVariant();
  }, [onboardingFinished]);

  if (!mounted) return null;

  const isLoading = runsLoading || statsLoading;

  return (
    <main className="flex-1 flex flex-col h-screen overflow-hidden bg-void">
      {/* Header Bar Area */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-void/50 backdrop-blur-xl z-20">
          <div className="flex items-center gap-6 flex-1 max-w-2xl">
            <div className="relative flex-1 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 group-focus-within:text-acid transition-colors" />
              <input 
                type="text" 
                placeholder="Search repositories, runs, or agents..." 
                className="w-full bg-white/5 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-acid/20 transition-all font-light"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 px-3 border border-white/5">
              <div className="h-1.5 w-1.5 rounded-full bg-acid animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">System Live</span>
            </div>
            
            <button className="p-2.5 hover:bg-white/5 rounded-xl text-slate-500 transition-colors relative">
              <Bell size={18} />
              <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 bg-plasma rounded-full border border-void" />
            </button>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-acid to-plasma p-[1px]">
              <div className="h-full w-full rounded-[11px] bg-void flex items-center justify-center">
                <span className="text-xs font-black text-acid">DS</span>
              </div>
            </div>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-8 lg:p-10 space-y-8 min-w-0 custom-scrollbar">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
                Dashboard
                <div className="px-2 py-1 rounded bg-acid/10 border border-acid/20 text-[10px] uppercase tracking-tighter text-acid mt-1">v1.2.4-PRO</div>
              </h1>
              <p className="text-xs text-slate-500 font-medium ml-1 uppercase tracking-widest">Real-time autonomous resolution metrics</p>
            </div>
          </div>

          <OnboardingChecklist />

          <StatsGrid stats={stats} isLoading={statsLoading} />

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2">
              <RunsTable runs={runs} onSelectRun={setSelectedRun} isDemo={isDemo} />
            </div>

            {/* AI Insights Panel */}
            <div className="space-y-4">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-ice flex items-center gap-2">
                <Zap size={16} className="text-ice" />
                AI Strategy Insights
              </h2>

              <div className="rounded-2xl border border-white/5 bg-void/40 backdrop-blur-sm p-6 space-y-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-ice/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-ice/10 transition-colors duration-700" />
                
                {insights.length === 0 ? (
                  <div className="py-12 text-center space-y-3">
                    <div className="mx-auto h-12 w-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center mb-4">
                      <Activity className="text-slate-700" size={20} />
                    </div>
                    <p className="text-[11px] text-slate-500 uppercase tracking-widest font-bold">Awaiting Data Cycles</p>
                    <p className="text-[10px] text-slate-600 leading-relaxed px-4">Insights will generate automatically as the autonomous agent completes its first few runs.</p>
                  </div>
                ) : (
                  insights.map((insight, idx) => (
                    <div key={idx} className="flex gap-5 group/item">
                      <div className={`mt-0.5 h-10 w-10 shrink-0 rounded-xl flex items-center justify-center border transition-all duration-300 group-hover/item:scale-110 ${
                        insight.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                        insight.type === 'performance' ? 'bg-acid/10 border-acid/20 text-acid' :
                        'bg-ice/10 border-ice/20 text-ice'
                      }`}>
                        {insight.type === 'error' && <Zap size={18} />}
                        {insight.type === 'performance' && <RefreshCw size={18} />}
                        {insight.type === 'time' && <Activity size={18} />}
                        {insight.type === 'mttr' && <TrendingUp size={18} />}
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-white/90">{insight.title}</h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{insight.body}</p>
                      </div>
                    </div>
                  ))
                )}

                <div className="pt-4 border-t border-white/5">
                  <button className="w-full py-4 rounded-xl bg-white/5 border border-white/5 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all">
                    View Full Strategy Guide
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {selectedRun && (
          <RunDetailModal 
            run={selectedRun} 
            onClose={() => setSelectedRun(null)} 
          />
        )}
        <AddRepoModal />
      </main>
  );
}

function TrendingUp(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  )
}
