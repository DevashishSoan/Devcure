"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Play, CheckCircle2, Zap } from "lucide-react";
import { GithubIcon } from "./Icons";
import { getVariant, trackABEvent } from "@/lib/ab-testing";
import { getAnonymousId } from "@/lib/anonymous-id";

export const Hero = () => {
  const mockupRef = useRef<HTMLDivElement>(null);
  const [variant, setVariant] = useState<'A' | 'B'>('A');
  const [anonymousId, setAnonymousId] = useState<string>('');

  useEffect(() => {
    const anonId = getAnonymousId();
    const v = getVariant('hero-cta-v1', anonId);
    setVariant(v);
    setAnonymousId(anonId);

    // Track impression
    trackABEvent({
      experimentId: 'hero-cta-v1',
      variant: v,
      event: 'impression',
      anonymousId: anonId,
      timestamp: new Date()
    });
  }, []);

  const handleCTAClick = () => {
    trackABEvent({
      experimentId: 'hero-cta-v1',
      variant: variant,
      event: 'cta_click',
      anonymousId: anonymousId,
      timestamp: new Date()
    });
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center pt-[120px] pb-[160px] overflow-hidden">
      {/* Background Halos */}
      <div className="orb-1" />
      <div className="orb-2" />
      <div className="orb-3" />

      {/* Beta Badge */}
      <div className="reveal flex items-center gap-2 px-3 py-1 rounded-full border border-[rgba(0,255,136,0.25)] bg-[rgba(0,255,136,0.06)] mb-8" style={{ transitionDelay: '0ms' }}>
        <div className="w-2 h-2 rounded-full bg-[var(--acid)] animate-pulse" />
        <span className="text-[11px] font-mono text-[var(--acid)] font-medium uppercase tracking-wider">
          Now in public beta — zero cost to start
        </span>
      </div>

      {/* Headline */}
      <h1 className="text-center mb-6 max-w-[1200px] px-6">
        <span className="reveal block text-[clamp(52px,8vw,96px)] font-bold text-[var(--text-muted)] font-[var(--font-display)] leading-[0.95]" style={{ transitionDelay: '100ms' }}>
          Your code breaks.
        </span>
        <span className="reveal block text-[clamp(52px,8vw,96px)] font-bold text-[var(--acid)] font-[var(--font-display)] leading-[0.95]" style={{ transitionDelay: '150ms' }}>
          We fix it.
        </span>
        <span className="reveal block text-[clamp(52px,8vw,96px)] font-bold text-[var(--text-primary)] font-[var(--font-display)] leading-[0.95]" style={{ transitionDelay: '200ms' }}>
          Automatically.
        </span>
      </h1>

      {/* Subheadline */}
      <p className="reveal text-center text-lg md:text-xl font-light text-[var(--text-secondary)] max-w-[520px] mb-10 px-6 font-[var(--font-body)]" style={{ transitionDelay: '300ms' }}>
        The autonomous AI agent that diagnoses test failures and writes minimal, surgical patches for your pull requests.
      </p>

      {/* CTAs */}
      <div className="reveal flex flex-col sm:flex-row items-center gap-4 mb-8 px-6" style={{ transitionDelay: '400ms' }}>
          <Link
            href="/signup"
            onClick={handleCTAClick}
            className="flex items-center gap-2 px-6 py-3.5 bg-[var(--acid)] text-[var(--void)] rounded-lg font-bold font-[var(--font-display)] transition-all hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(0,255,136,0.4)]"
          >
            {variant === 'A' ? (
              <>
                <GithubIcon className="w-5 h-5" />
                Connect GitHub free
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 fill-current" />
                Fix my first bug automatically
              </>
            )}
          </Link>
        <button className="flex items-center gap-2 px-6 py-3.5 bg-transparent border border-[var(--border-bright)] text-[var(--text-primary)] rounded-lg font-bold font-[var(--font-display)] transition-all hover:bg-white/5">
          <Play className="w-4 h-4 fill-current" />
          Watch 90s demo
        </button>
      </div>

      {/* Trust Line */}
      <div className="reveal text-[11px] font-mono text-[var(--text-muted)] uppercase tracking-widest mb-20" style={{ transitionDelay: '500ms' }}>
        No credit card · Free forever on 1 repo · Setup in 3 minutes
      </div>

      {/* Dashboard Mockup */}
      <div className="reveal px-6 w-full max-w-[1100px] hero-mockup-wrap" style={{ transitionDelay: '600ms' }}>
        <div ref={mockupRef} className="dashboard-mockup glass-card overflow-hidden border-[var(--border-bright)] shadow-2xl">
          {/* Title bar */}
          <div className="h-10 bg-white/[0.03] border-b border-[var(--border)] flex items-center px-4 justify-between">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
            </div>
            <div className="bg-[var(--void)]/40 px-3 py-1 rounded text-[10px] text-[var(--text-muted)] font-mono border border-[var(--border)]">
              app.devcure.ai / dashboard
            </div>
            <div className="w-12" />
          </div>

          <div className="flex h-[500px]">
            {/* Sidebar */}
            <div className="w-56 border-r border-[var(--border)] bg-white/[0.01] p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 mb-6 px-2">
                <div className="w-5 h-5 rounded bg-[var(--acid)]" />
                <span className="font-bold text-xs">DevCure</span>
              </div>
              {['Runs', 'Repos', 'Alerts', 'Settings', 'Docs'].map((item, i) => (
                <div key={item} className={`px-3 py-2 rounded-md text-[11px] font-medium flex items-center gap-2 ${i === 0 ? 'bg-[var(--acid-dim)] text-[var(--acid)]' : 'text-[var(--text-secondary)] hover:bg-white/[0.04]'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-[var(--acid)]' : 'bg-transparent'}`} />
                  {item}
                </div>
              ))}
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 overflow-hidden">
              <div className="grid grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Total Runs', value: '1,284', color: 'var(--acid)' },
                  { label: 'Resolved', value: '1,052', color: 'var(--text-primary)' },
                  { label: 'Avg MTTR', value: '3.8m', color: 'var(--ice)' },
                  { label: 'Escalated', value: '12', color: 'var(--ember)' }
                ].map(stat => (
                  <div key={stat.label} className="glass-card p-4 border-[var(--border)]">
                    <div className="text-[10px] text-[var(--text-secondary)] font-mono uppercase mb-1">{stat.label}</div>
                    <div className="text-2xl font-bold font-[var(--font-display)]" style={{ color: stat.color }}>{stat.value}</div>
                  </div>
                ))}
              </div>

              {/* Table */}
              <div className="bg-[var(--surface-3)] rounded-lg border border-[var(--border)] overflow-hidden">
                <div className="grid grid-cols-4 gap-4 p-3 border-b border-[var(--border)] bg-white/[0.02]">
                  {['Repository', 'Status', 'Runtime', 'Action'].map(h => (
                    <div key={h} className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-widest">{h}</div>
                  ))}
                </div>
                {[
                  { repo: 'frontend-core', status: 'Running', time: '1m 12s', color: 'var(--acid)' },
                  { repo: 'api-service', status: 'Completed', time: '4m 05s', color: 'var(--ice)' },
                  { repo: 'auth-worker', status: 'Escalated', time: '8m 22s', color: 'var(--ember)' }
                ].map((row, i) => (
                  <div key={i} className="grid grid-cols-4 gap-4 p-4 border-b border-[var(--border)] last:border-0 hover:bg-white/[0.02] transition-colors">
                    <div className="text-xs font-medium text-[var(--text-primary)]">devcure/{row.repo}</div>
                    <div className="flex items-center gap-2">
                       <div className={`w-2 h-2 rounded-full ${row.status === 'Running' ? 'animate-pulse' : ''}`} style={{ backgroundColor: row.color }} />
                       <span className="text-[10px] font-mono uppercase font-bold" style={{ color: row.color }}>{row.status}</span>
                    </div>
                    <div className="text-xs text-[var(--text-secondary)] font-mono">{row.time}</div>
                    <div className="text-[10px] font-bold text-[var(--acid)] uppercase tracking-wider">View PR →</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .hero-mockup-wrap {
          perspective: 1200px;
        }
        .dashboard-mockup {
          transform: rotateX(6deg) rotateY(-2deg) rotateZ(1deg);
          transform-origin: center top;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .hero-mockup-wrap:hover .dashboard-mockup {
          transform: rotateX(2deg) rotateY(0deg) rotateZ(0deg);
        }
      `}</style>
    </section>
  );
};
