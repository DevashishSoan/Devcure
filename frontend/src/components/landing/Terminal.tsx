"use client";

import React, { useState, useEffect } from "react";

const CODE_ANIMATION = [
  { type: "info", text: "--- Running verification on api-server/main ---" },
  { type: "error", text: "F FAIL tests/test_auth.py::test_login_success" },
  { type: "error", text: "  TypeError: 'NoneType' object is not subscriptable" },
  { type: "info", text: "AI identifying root cause..." },
  { type: "add", text: "+ if user and user.get('id'):" },
  { type: "add", text: "+     return generate_token(user['id'])" },
  { type: "remove", text: "- return generate_token(user['id'])" },
  { type: "info", text: "Rerunning tests..." },
  { type: "success", text: ". tests/test_auth.py::test_login_success PASSED" },
  { type: "success", text: "PASSED [100%]" },
  { type: "info", text: "Pull request ready: Fix auth token generation" },
];

export function Terminal() {
  const [lines, setLines] = useState<number>(0);
  const [flux, setFlux] = useState<number>(12);
  const [isGlitching, setIsGlitching] = useState(false);
  const [cpuFlux, setCpuFlux] = useState(42);
  const [isFixed, setIsFixed] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCpuFlux(prev => {
        const delta = Math.floor(Math.random() * 15) - 7;
        return Math.min(Math.max(prev + delta, 12), 98);
      });
    }, 1200);

    const fixTimer = setTimeout(() => setIsFixed(true), 4000);

    return () => {
      clearInterval(interval);
      clearTimeout(fixTimer);
    };
  }, []);

  return (
    <div className={`
      relative w-full max-w-[640px] aspect-[16/10] 
      bg-bg-surface border border-border-default rounded-[4px]
      shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden
      transition-all duration-700
      ${isFixed ? 'animate-prism-flash border-accent-primary/50' : ''}
    `}
    style={{
      transform: 'rotateX(calc((var(--cursor-y) - 50vh) / -50)) rotateY(calc((var(--cursor-x) - 50vw) / 50))',
      transformStyle: 'preserve-3d'
    }}
    >
      {/* ─── Hardware Header ─── */}
      <div className="h-10 border-b border-border-default flex items-center justify-between px-4 bg-bg-elevated/50">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full border border-border-default bg-bg-base" />
          <div className="w-2.5 h-2.5 rounded-full border border-border-default bg-bg-base" />
          <div className="w-2.5 h-2.5 rounded-full border border-border-default bg-bg-base" />
          <span className="ml-2 text-[10px] font-mono text-text-muted uppercase tracking-widest font-bold">Unit_01 // repair_agent.sh</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <div className="text-[9px] font-mono text-text-muted leading-none mb-0.5">PWR</div>
            <div className="w-8 h-1 bg-bg-base border border-border-default rounded-full overflow-hidden">
              <div className="h-full bg-accent-primary w-2/3" />
            </div>
          </div>
          <div className="px-2 py-0.5 border border-border-default rounded-[2px] text-[9px] font-mono text-accent-primary bg-accent-primary/5">
            LOAD: {cpuFlux}%
          </div>
        </div>
      </div>

      {/* ─── Terminal Body ─── */}
      <div className="p-6 font-mono text-[13px] leading-relaxed overflow-y-auto h-[calc(100%-40px)]">
        <div className="flex gap-3 mb-2 opacity-50">
          <span className="text-accent-primary">#</span>
          <span>Initiating autonomous diagnosis...</span>
        </div>
        <div className="flex gap-3 mb-2">
          <span className="text-text-muted">1</span>
          <span>Cloning repository <span className="text-accent-secondary">devcure/api-core</span>...</span>
        </div>
        <div className="flex gap-3 mb-2">
          <span className="text-text-muted">2</span>
          <span>Identifying failed tests in <span className="text-accent-red">/tests/test_auth.py</span></span>
        </div>
        <div className="flex gap-3 mb-4">
          <span className="text-text-muted">3</span>
          <span className="text-accent-red">Error: TokenExpired at line 124 in middleware.py</span>
        </div>
        
        <div className="my-6 p-4 bg-bg-base/50 border-l border-accent-primary border-y border-border-default relative group">
          <div className="absolute -top-2.5 left-4 px-2 bg-bg-surface text-[9px] font-bold text-accent-primary uppercase tracking-widest">
            AI Correction Logic
          </div>
          <div className="flex gap-3 text-text-secondary italic">
            <span>&gt; Analyzed pattern: Missing refresh token check.</span>
          </div>
          <div className="flex gap-3 mt-2 text-accent-primary">
            <span>+  if not token.isValid():</span>
          </div>
          <div className="flex gap-3 text-accent-primary">
            <span>+     return triggerRefresh()</span>
          </div>
        </div>

        {isFixed && (
          <div className="animate-in slide-in-from-bottom-2 duration-500">
            <div className="flex gap-3 mb-2">
              <span className="text-accent-primary">#</span>
              <span className="text-accent-primary font-bold">Correction verified. Tests passing.</span>
            </div>
            <div className="flex gap-3 mb-2">
              <span className="text-text-muted">4</span>
              <span>Generating pull request...</span>
            </div>
            <div className="flex gap-3">
              <span className="text-text-muted">5</span>
              <span className="px-2 bg-accent-primary text-bg-base font-bold rounded-[2px] text-[11px] animate-pulse">
                PR #482 OPENED
              </span>
            </div>
          </div>
        )}
        
        {/* ─── Cursor ─── */}
        <div className="w-2 h-4 bg-accent-primary/40 inline-block ml-1 animate-pulse" />
      </div>

      {/* ─── Hardware Overlay ─── */}
      <div className="absolute inset-0 pointer-events-none border-[12px] border-bg-surface/50 opacity-20" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/5 to-transparent" />
    </div>
  );
}
