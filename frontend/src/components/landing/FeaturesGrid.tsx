"use client";

import { FileDiff, Zap, Lightbulb, Shield, Activity, Settings, Lock } from "lucide-react";
import { use3DTilt } from "@/hooks/use3DTilt";

const features = [
  {
    icon: Zap,
    title: "Autonomous resolution",
    tag: "Active",
    desc: "Our agent doesn't just find bugs—it creates verified, ready-to-merge patches.",
    color: "var(--acid)",
    span: 1
  },
  {
    icon: Lightbulb,
    title: "Gemini-powered diagnosis",
    tag: "Gemini Flash",
    desc: "Advanced neural reasoning that understands context, not just syntax.",
    color: "var(--plasma)",
    span: 1
  },
  {
    icon: Shield,
    title: "Safety-first execution",
    desc: "Every fix is run in a secure, isolated vVisor sandbox before you ever see it.",
    color: "var(--ice)",
    span: 1
  },
  {
    icon: FileDiff,
    title: "Surgical diff — not rewrites",
    desc: "We prioritize minimal changes. The AI writes code that looks like yours, only fixed.",
    isDiff: true,
    span: 2
  },
  {
    icon: Activity,
    title: "Realtime dashboard",
    tag: "Supabase Realtime",
    desc: "Watch the AI move through your code live. Full logging of every thought process.",
    color: "var(--acid)",
    span: 1
  },
  {
    icon: Settings,
    title: "Deep infra integration",
    desc: "Hooks directly into your CI/CD and Slack for seamless dev-cycle repairs.",
    color: "var(--text-muted)",
    span: 1
  }
];

export const FeaturesGrid = () => {
  return (
    <section id="features" className="section-padding bg-[var(--void)]">
      <div className="reveal text-center mb-20 px-6">
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="w-5 h-[1px] bg-[var(--text-muted)]" />
          <span className="text-[11px] font-mono text-[var(--text-muted)] uppercase tracking-[0.2em] font-bold">Comprehensive Capabilities</span>
        </div>
        <h2 className="text-[clamp(32px,5vw,52px)] font-bold font-[var(--font-display)] mb-6">
          The brain your <br /> codebase deserves.
        </h2>
        <p className="text-[var(--text-secondary)] font-light max-w-xl mx-auto">
          We combined the reasoning power of Gemini with a custom logic sandbox to build an engine that actually understands your intent.
        </p>
      </div>

      <div className="reveal max-w-[1200px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <FeatureCard key={i} feature={f} i={i} />
        ))}
      </div>
    </section>
  );
};

const FeatureCard = ({ feature, i }: { feature: any, i: number }) => {
  const { cardRef, style, parallaxOffset, onMouseMove, onMouseLeave } = use3DTilt({ max: 12 });

  return (
    <div 
      ref={cardRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={`glass-card p-8 group flex flex-col justify-between h-[380px] ${feature.span === 2 ? 'md:col-span-2' : ''}`}
      style={style}
    >
      <div className="relative z-10" style={{ transform: `translateZ(40px) translateX(${parallaxOffset.x * 0.5}px) translateY(${parallaxOffset.y * 0.5}px)` }}>
        <div className="flex justify-between items-start mb-10">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center border border-[var(--border-bright)] bg-white/[0.03] transition-colors group-hover:border-[rgba(255,255,255,0.2)]"
            style={{ 
              color: feature.color,
              boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'
            }}
          >
            <feature.icon size={24} />
          </div>
          {feature.tag && (
            <span className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-widest border border-[var(--border)] px-2 py-1 rounded">
              {feature.tag}
            </span>
          )}
        </div>

        <h3 className="text-xl font-bold font-[var(--font-display)] text-white mb-3">
          {feature.title}
        </h3>
        <p className="text-sm font-light text-[var(--text-secondary)] leading-relaxed">
          {feature.desc}
        </p>
      </div>

      {feature.isDiff && (
        <div 
          className="mt-4 rounded-lg bg-[var(--void)] border border-[var(--border)] overflow-hidden font-mono text-[11px] relative z-20 pointer-events-none"
          style={{ 
            transform: `translateZ(60px) scale(1.05) translateX(${parallaxOffset.x * -0.3}px)`,
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
          }}
        >
          <div className="px-3 py-1.5 border-b border-[var(--border)] bg-white/[0.02] text-[var(--text-muted)] flex items-center gap-2">
            <FileDiff className="w-3 h-3" />
            <span>auth.ts — surgical update</span>
          </div>
          <div className="p-4 space-y-1">
            <div className="text-[#ff5f56]">- export const authenticate = async (u: string)</div>
            <div className="text-[#27c93f]">+ export const authenticate = async (cred: AuthCreds)</div>
            <div className="mt-2 text-[var(--text-dim)]">// Optimized type safety via Gemini Flash</div>
          </div>
        </div>
      )}
    </div>
  );
};
