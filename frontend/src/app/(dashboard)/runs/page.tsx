"use client";

import React, { useState, useEffect } from "react";
import { fetchRuns, subscribeToAllRuns } from "@/lib/api";
import RunsTable from "@/components/RunsTable";
import RunDetailModal from "@/components/RunDetailModal";
import { Activity, RefreshCw } from "lucide-react";

export default function RunsPage() {
  const [runs, setRuns] = useState<any[]>([]);
  const [selectedRun, setSelectedRun] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRuns();
    
    // Activate real-time protocol
    const channel = subscribeToAllRuns(() => {
      loadRuns();
    });

    return () => {
      channel.unsubscribe();
    };
  }, []);

  async function loadRuns() {
    setIsLoading(true);
    try {
      const data = await fetchRuns();
      setRuns(data);
    } catch (err) {
      console.error("Failed to fetch protocol history");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex-1 flex flex-col min-w-0 bg-transparent relative">
      <header className="h-24 border-b border-white/5 bg-[#020617]/40 backdrop-blur-3xl px-10 flex items-center justify-between shrink-0 relative z-10">
          <div className="space-y-1">
            <h1 className="text-2xl font-medium text-white tracking-tight flex items-center gap-3 font-display">
              Protocol History
              <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 shadow-[0_0_10px_#6366f133]">
                <Activity className="text-indigo-400" size={18} />
              </div>
            </h1>
            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em]">Full Audit Trajectory Log</p>
          </div>
          
          <button 
            onClick={loadRuns}
            className="flex items-center gap-3 px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-[11px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all font-display"
          >
            <RefreshCw size={14} />
            Resync_Audit
          </button>
      </header>

      <section className="flex-1 overflow-y-auto p-10 space-y-12 relative z-10 custom-scrollbar">
        <div className="max-w-[1400px] mx-auto">
          <RunsTable runs={runs} onSelectRun={setSelectedRun} isLoading={isLoading} />
        </div>
      </section>

      {selectedRun && (
        <RunDetailModal 
          run={selectedRun} 
          onClose={() => setSelectedRun(null)} 
        />
      )}
    </main>
  );
}
