"use client";

import React, { useState, useEffect } from "react";
import { fetchRuns } from "@/lib/api";
import RunsTable from "@/components/RunsTable";
import RunDetailModal from "@/components/RunDetailModal";

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
    const data = await fetchRuns();
    setRuns(data);
    setIsLoading(false);
  }

  return (
    <main className="flex-1 flex flex-col min-w-0 bg-bg-base">
      <header className="h-16 border-b border-border-subtle bg-bg-surface/60 backdrop-blur-xl px-8 flex items-center justify-between shrink-0">
          <h1 className="text-xl font-bold text-white">Autonomous Runs</h1>
          <button 
            onClick={loadRuns}
            className="text-xs font-black uppercase tracking-widest text-accent-primary hover:text-white transition-colors"
          >
            Refresh
          </button>
        </header>

        <section className="flex-1 overflow-y-auto p-8 lg:p-10">
          <RunsTable runs={runs} onSelectRun={setSelectedRun} />
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
