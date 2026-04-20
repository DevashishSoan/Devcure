"use client";

import Link from "next/link";
import { GithubIcon } from "./Icons";
import { use3DTilt } from "@/hooks/use3DTilt";

export const CTASection = () => {
  const { cardRef, style, parallaxOffset, onMouseMove, onMouseLeave } = use3DTilt({ max: 6 });

  return (
    <section className="relative py-[160px] flex flex-col items-center justify-center overflow-hidden">
      {/* Target Halo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--acid)]/10 blur-[120px] rounded-full pointer-events-none" />

      <div 
        ref={cardRef}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        className="reveal relative z-10 glass-card p-16 md:p-24 text-center max-w-[1000px] mx-6" 
        style={style}
      >
        <div style={{ transform: `translateZ(40px) translateX(${parallaxOffset.x}px)` }}>
          <h2 className="text-[clamp(44px,7vw,84px)] font-extrabold font-[var(--font-display)] leading-[1.05] mb-8 text-white">
            Stop debugging. <br />
            <span className="text-[var(--acid)]">Start shipping.</span>
          </h2>
          
          <p className="text-lg md:text-xl font-light text-[var(--text-secondary)] max-w-[400px] mx-auto mb-12 font-[var(--font-body)]">
            Connect your first repository today and let the agent handle the test failures.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
            <Link
              href="/signup"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-10 py-4 bg-[var(--acid)] text-[var(--void)] rounded-lg font-bold font-[var(--font-display)] transition-all hover:-translate-y-0.5 shadow-[0_10px_30px_rgba(0,255,136,0.3)] hover:shadow-[0_15px_40px_rgba(0,255,136,0.5)]"
              style={{ transform: `translateZ(15px)` }}
            >
              <GithubIcon className="w-5 h-5" />
              Connect GitHub free
            </Link>
            <Link
              href="/docs"
              className="w-full sm:w-auto px-10 py-4 bg-transparent border border-[var(--border-bright)] text-[var(--text-primary)] rounded-lg font-bold font-[var(--font-display)] transition-all hover:bg-white/5"
              style={{ transform: `translateZ(10px)` }}
            >
              Read documentation
            </Link>
          </div>

          <div 
            className="text-[11px] font-mono text-[var(--text-muted)] uppercase tracking-[0.3em]"
            style={{ transform: `translateZ(5px)` }}
          >
            No Credit Card Required · Setup in &lt; 3 Minutes
          </div>
        </div>
      </div>
    </section>
  );
};
