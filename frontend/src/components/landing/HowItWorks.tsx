"use client";

import { CheckCircle2, GitPullRequest } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Webhook triggers on push",
    desc: "DevCure receives a GitHub push event the moment you commit. HMAC-verified, zero latency."
  },
  {
    number: "02",
    title: "AI generates & runs tests",
    desc: "Gemini analyzes your diff and generates targeted unit tests. Runs them in an isolated sandbox."
  },
  {
    number: "03",
    title: "Diagnosis + surgical repair",
    desc: "If tests fail, the AI reads the error log, identifies root cause, and writes a minimal patch."
  },
  {
    number: "04",
    title: "PR opened automatically",
    desc: "Once the fix passes all tests, a clean Pull Request is opened. You review and merge."
  }
];

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="section-padding max-w-[1200px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
      {/* Left Column */}
      <div className="reveal">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-5 h-[1px] bg-[var(--text-muted)]" />
          <span className="text-[11px] font-mono text-[var(--text-muted)] uppercase tracking-[0.2em] font-bold">How it works</span>
        </div>
        
        <h2 className="text-[clamp(36px,5vw,60px)] font-bold font-[var(--font-display)] leading-[1.1] mb-12">
          Push code. <br />
          <span className="text-[var(--acid)]">We handle</span> <br />
          the rest.
        </h2>

        <div className="space-y-12 relative">
          {/* Connector Line */}
          <div className="absolute left-[20px] top-4 bottom-4 w-[1px] bg-[var(--border)] z-0" />

          {steps.map((step, i) => (
            <div key={i} className="relative z-10 flex gap-6 group">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[var(--surface-3)] border border-[var(--border-bright)] flex items-center justify-center font-mono text-[var(--acid)] font-bold text-sm shadow-lg group-hover:border-[var(--acid)] transition-colors">
                {step.number}
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2 group-hover:text-[var(--acid)] transition-colors">{step.title}</h3>
                <p className="text-[var(--text-secondary)] font-light leading-relaxed max-w-sm">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Terminal */}
      <div className="reveal relative">
        {/* Glow behind terminal */}
        <div className="absolute -inset-10 bg-[var(--plasma)]/10 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="terminal-card glass-card border-[var(--border-bright)] p-1 overflow-hidden" style={{ transform: 'rotateY(-4deg)', backdropFilter: 'var(--glass-blur-heavy)' }}>
          {/* Title Bar */}
          <div className="flex items-center justify-between px-4 py-2 bg-white/[0.03] border-b border-[var(--border)]">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
              <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
              <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
            </div>
            <div className="text-[10px] font-mono text-[var(--text-muted)]">devcure · live agent log</div>
            <div className="w-10" />
          </div>

          <div className="p-5 font-mono text-[11px] leading-relaxed h-[400px] overflow-y-auto">
            <div className="mb-2"><span className="text-[var(--ice)]">[DETECT]</span> <span className="text-[var(--text-secondary)]">Push detected on main: </span><span className="text-[var(--text-primary)]">82a17f2</span></div>
            <div className="mb-2"><span className="text-[var(--ice)]">[CLONE]</span> <span className="text-[var(--text-secondary)]">Cloning repository to isolated sandbox...</span></div>
            <div className="mb-2"><span className="text-[var(--ice)]">[TESTS]</span> <span className="text-[var(--text-secondary)]">Running 42 existing tests...</span></div>
            <div className="mb-2"><span className="text-[var(--ice)]">[EXEC]</span> <span className="text-[var(--text-secondary)]">Results: </span><span className="text-red-400">1 FAILED</span><span className="text-[var(--text-secondary)]"> / 41 PASSED</span></div>
            <div className="mb-2"><span className="text-[var(--plasma)]">[DIAG]</span> <span className="text-[var(--text-secondary)]">Analyzing stack trace and current diff...</span></div>
            <div className="mb-2"><span className="text-[var(--plasma)]">[ROOT]</span> <span className="text-[var(--text-secondary)]">Cause: </span><span className="text-[var(--plasma-bright)]">TypeError at auth.ts:142</span></div>
            <div className="mb-2"><span className="text-[var(--acid)]">[REPAIR]</span> <span className="text-[var(--text-secondary)]">Generating surgical fix for Null Pointer...</span></div>
            <div className="mb-2"><span className="text-[var(--acid)]">[GATE]</span> <span className="text-[var(--text-secondary)]">Safety check: patch doesn't violate RLS.</span></div>
            <div className="mb-2"><span className="text-[var(--ember)]">[VERIFY]</span> <span className="text-[var(--text-secondary)]">Rerunning tests: </span><span className="text-[var(--acid)]">42 PASSED (GREEN)</span></div>
            <div className="mb-4"><span className="text-[var(--acid)]">[DONE]</span> <span className="text-[var(--text-secondary)]">Success. Opening PR.</span></div>
            
            <div className="animate-blink inline-block w-2 h-4 bg-[var(--acid)] ml-1" />

            {/* PR Box */}
            <div className="mt-8 border border-[var(--acid)]/30 bg-[var(--acid-dim)] rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <GitPullRequest className="w-4 h-4 text-[var(--acid)]" />
                  <span className="text-[var(--text-primary)] font-bold text-xs">PR #124: Fix auth null pointer</span>
                </div>
                <div className="px-2 py-0.5 rounded bg-[var(--acid)]/20 text-[var(--acid)] text-[9px] font-bold">READY</div>
              </div>
              <div className="text-[10px] text-[var(--text-secondary)]">Surgical fix verified across 42 tests. Zero regressions.</div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .terminal-card {
          perspective: 1000px;
        }
      `}</style>
    </section>
  );
};
