"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CheckCircle2,
  Clock,
  GitPullRequest,
  Terminal,
  Zap,
  Shield,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

// ─── Competitor Comparison Table ────────────────────────────────────────────

const COMPETITORS = [
  {
    name: "DevCure",
    highlight: true,
    capabilities: {
      "Code-level patch generation": true,
      "Agent reasoning transparency": true,
      "Sandboxed repair execution": true,
      "Confidence scoring": true,
      "pytest / Jest / Vitest": true,
      "UI locator self-healing": "roadmap",
      "Open source": true,
    },
  },
  {
    name: "Testim / Tricentis",
    capabilities: {
      "Code-level patch generation": false,
      "Agent reasoning transparency": false,
      "Sandboxed repair execution": false,
      "Confidence scoring": false,
      "pytest / Jest / Vitest": false,
      "UI locator self-healing": true,
      "Open source": false,
    },
  },
  {
    name: "Mabl",
    capabilities: {
      "Code-level patch generation": false,
      "Agent reasoning transparency": false,
      "Sandboxed repair execution": false,
      "Confidence scoring": false,
      "pytest / Jest / Vitest": false,
      "UI locator self-healing": true,
      "Open source": false,
    },
  },
  {
    name: "Functionize",
    capabilities: {
      "Code-level patch generation": false,
      "Agent reasoning transparency": false,
      "Sandboxed repair execution": false,
      "Confidence scoring": false,
      "pytest / Jest / Vitest": false,
      "UI locator self-healing": true,
      "Open source": false,
    },
  },
];

const CAPABILITY_ROWS = Object.keys(COMPETITORS[0].capabilities);

function CellIcon({ value }: { value: boolean | string }) {
  if (value === "roadmap") {
    return <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Q3 2026</span>;
  }
  if (value === true) {
    return <CheckCircle2 size={18} className="text-emerald-500 mx-auto" />;
  }
  return (
    <div className="w-4 h-0.5 bg-zinc-800 mx-auto rounded-full" />
  );
}

export function CompetitorTable() {
  return (
    <section className="py-24 px-6 relative overflow-hidden" id="compare">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-[11px] font-mono uppercase tracking-[0.4em] text-[#0891B2] mb-4 block">
            Competitive Landscape
          </span>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-white mb-6">
            The only platform that<br />
            <span className="text-[#0891B2]">patches code, not just UI.</span>
          </h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Every competitor self-heals UI locators. DevCure generates actual code patches
            with a full reasoning trace — a capability no major platform offers today.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="overflow-x-auto rounded-[32px] border border-white/5 bg-zinc-950/60 backdrop-blur-2xl shadow-2xl"
        >
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-white/5">
                <th className="p-6 pl-8 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] w-[280px]">
                  Capability
                </th>
                {COMPETITORS.map((c) => (
                  <th
                    key={c.name}
                    className={`p-6 text-center text-sm font-bold ${
                      c.highlight
                        ? "text-[#0891B2]"
                        : "text-zinc-400"
                    }`}
                  >
                    {c.highlight && (
                      <div className="inline-block mb-2 px-2 py-0.5 rounded-full bg-[#0891B2]/10 border border-[#0891B2]/20 text-[9px] text-[#0891B2] uppercase tracking-widest font-black">
                        ← You Are Here
                      </div>
                    )}
                    <div>{c.name}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {CAPABILITY_ROWS.map((row, i) => (
                <tr key={row} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="p-5 pl-8 text-[13px] font-medium text-zinc-300 group-hover:text-white transition-colors">
                    {row}
                  </td>
                  {COMPETITORS.map((c) => (
                    <td
                      key={c.name}
                      className={`p-5 text-center ${
                        c.highlight ? "bg-[#0891B2]/[0.03]" : ""
                      }`}
                    >
                      <CellIcon value={c.capabilities[row as keyof typeof c.capabilities]} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center text-xs text-zinc-600 mt-6"
        >
          Competitor capabilities assessed from public documentation as of Q2 2026. UI self-healing = locator-based repair only.
        </motion.p>
      </div>
    </section>
  );
}

// ─── Try Demo Modal ──────────────────────────────────────────────────────────

const DEMO_STEPS = [
  {
    event: "queued",
    icon: Terminal,
    color: "text-zinc-400",
    bg: "bg-zinc-800/50",
    label: "Sandbox allocated",
    log: "Repair job queued. Allocating isolated execution environment...",
    duration: 1200,
  },
  {
    event: "baseline_captured",
    icon: Shield,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    label: "Baseline captured",
    log: "Detected pytest. Found 1 baseline failure.\n\nFAILED tests/test_api.py::test_get_user_profile\n  AssertionError: assert 404 == 200",
    duration: 1800,
  },
  {
    event: "diagnosed",
    icon: Zap,
    color: "text-[#0891B2]",
    bg: "bg-[#0891B2]/10",
    label: "Root cause identified",
    log: "TARGET: app/routes/users.py\n\nDIAGNOSIS: Route parameter renamed from {id} to {user_id} in refactor but test fixture calls old path. Fix: update route decorator to match function signature.",
    duration: 2200,
  },
  {
    event: "repair_applied",
    icon: GitPullRequest,
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
    label: "Patch applied [94% confidence]",
    log: "--- a/app/routes/users.py\n+++ b/app/routes/users.py\n@@ -18 +18 @@\n-@router.get('/users/{id}/profile')\n+@router.get('/users/{user_id}/profile')",
    duration: 1600,
  },
  {
    event: "completed",
    icon: CheckCircle2,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    label: "Verified — all tests passing",
    log: "✓ tests/test_api.py::test_get_user_profile PASSED\n✓ tests/test_api.py::test_list_users PASSED\n✓ tests/test_api.py::test_create_user PASSED\n\nTotal: 3 passed in 0.47s — PR opened.",
    duration: 0,
  },
];

function DemoStep({
  step,
  index,
  activeIndex,
}: {
  step: (typeof DEMO_STEPS)[0];
  index: number;
  activeIndex: number;
}) {
  const isDone = index < activeIndex;
  const isActive = index === activeIndex;
  const isPending = index > activeIndex;
  const Icon = step.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: isPending ? 0.3 : 1, x: 0 }}
      transition={{ delay: 0.05 * index }}
      className="flex gap-4 items-start"
    >
      <div
        className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-500 ${
          isActive ? step.bg + " " + step.color + " ring-1 ring-current/30" :
          isDone ? "bg-emerald-500/10 text-emerald-400" :
          "bg-zinc-900 text-zinc-700"
        }`}
      >
        {isDone ? <CheckCircle2 size={16} /> : <Icon size={16} />}
      </div>
      <div className="flex-1 min-w-0 pt-1.5">
        <p className={`text-[12px] font-bold transition-colors ${isActive ? "text-white" : isDone ? "text-zinc-400" : "text-zinc-700"}`}>
          {step.label}
        </p>
        {isActive && (
          <motion.pre
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-2 text-[10px] font-mono text-zinc-400 whitespace-pre-wrap leading-relaxed overflow-hidden"
          >
            {step.log}
          </motion.pre>
        )}
      </div>
    </motion.div>
  );
}

export function TryDemoModal({ onClose }: { onClose: () => void }) {
  const [activeStep, setActiveStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!isRunning) return;
    const timer = setInterval(() => setElapsed((e) => e + 0.1), 100);
    return () => clearInterval(timer);
  }, [isRunning]);

  const startDemo = () => {
    setIsRunning(true);
    setActiveStep(0);
    setElapsed(0);
    setDone(false);

    let current = 0;
    const advance = () => {
      if (current >= DEMO_STEPS.length - 1) {
        setDone(true);
        setIsRunning(false);
        return;
      }
      const delay = DEMO_STEPS[current].duration;
      setTimeout(() => {
        current++;
        setActiveStep(current);
        advance();
      }, delay);
    };
    advance();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-white/[0.02]">
          <div>
            <h2 className="text-lg font-bold text-white font-display">Live Healing Demo</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Simulating: <span className="font-mono text-[#0891B2]">your-org/api-service</span> — pytest failure
            </p>
          </div>
          <div className="flex items-center gap-4">
            {isRunning && (
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
                <Clock size={12} />
                {elapsed.toFixed(1)}s
              </div>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-all"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-8 space-y-6">
          {/* Steps */}
          <div className="space-y-5">
            {DEMO_STEPS.map((step, i) => (
              <DemoStep key={step.event} step={step} index={i} activeIndex={activeStep} />
            ))}
          </div>

          {/* Result */}
          <AnimatePresence>
            {done && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-bold text-emerald-400">Healed in 7.3 seconds</p>
                  <p className="text-xs text-zinc-500 mt-0.5">PR #42 opened · Confidence: 94%</p>
                </div>
                <a
                  href="/signup"
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#0891B2] text-black text-xs font-bold rounded-full hover:shadow-[0_0_20px_rgba(8,145,178,0.4)] transition-all"
                >
                  Try on your repo
                  <ChevronRight size={12} />
                </a>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        {!isRunning && !done && (
          <div className="px-8 pb-8">
            <button
              onClick={startDemo}
              className="w-full py-4 bg-[#0891B2] text-black font-bold rounded-2xl text-sm uppercase tracking-[0.2em] hover:shadow-[0_0_40px_rgba(8,145,178,0.3)] transition-all"
            >
              ▶ Run Simulation
            </button>
            <p className="text-center text-xs text-zinc-600 mt-3">
              No signup required · Uses pre-recorded fixture data
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
