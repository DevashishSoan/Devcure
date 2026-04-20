"use client";

import { Star } from "lucide-react";
import { use3DTilt } from "@/hooks/use3DTilt";

const testimonials = [
  {
    name: "Hakan Redzep",
    role: "Founding Engineer @ Vellum",
    content: "The first AI agent that actually gets the context of our mono-repo. The PRs it generates are cleaner than most human devs.",
    avatar: "HR",
    color: "from-blue-500 to-cyan-400"
  },
  {
    name: "Sarah Chen",
    role: "Staff SRE @ Linear",
    content: "We plugged DevCure into our CI and it caught a race condition in prod that had been haunting us for weeks. Surgical and precise.",
    avatar: "SC",
    color: "from-purple-500 to-pink-500"
  },
  {
    name: "Marcus Thorne",
    role: "Head of Infrastructure @ Scale",
    content: "DevCure is the security blanket our senior devs didn't know they needed. MTTR has dropped by 60% since implementation.",
    avatar: "MT",
    color: "from-orange-500 to-amber-500"
  }
];

export const Testimonials = () => {
  return (
    <section className="section-padding bg-[var(--void)] relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-[var(--plasma)]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="reveal text-center mb-20 px-6">
        <h2 className="text-3xl md:text-5xl font-bold font-[var(--font-display)] mb-6">
          Vetted by the world's <br /> best engineering teams.
        </h2>
      </div>

      <div className="reveal max-w-[1200px] mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((t, i) => (
          <TestimonialCard key={i} t={t} />
        ))}
      </div>
    </section>
  );
};

const TestimonialCard = ({ t }: { t: any }) => {
  const { cardRef, style, parallaxOffset, onMouseMove, onMouseLeave } = use3DTilt({ max: 8 });

  return (
    <div 
      ref={cardRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="glass-card p-10 flex flex-col justify-between"
      style={style}
    >
      <div className="relative z-10" style={{ transform: `translateZ(20px) translateX(${parallaxOffset.x * 0.2}px)` }}>
        <div className="flex gap-1 mb-8">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={14} className="fill-[var(--acid)] text-[var(--acid)] shadow-[0_0_10px_rgba(0,255,136,0.3)]" />
          ))}
        </div>

        <p className="text-[var(--text-secondary)] font-light leading-relaxed mb-10 italic">
          "{t.content}"
        </p>
      </div>

      <div className="flex items-center gap-4 relative z-20" style={{ transform: `translateZ(30px) translateX(${parallaxOffset.x * 0.4}px)` }}>
        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center font-bold text-[var(--void)] shadow-lg`}>
          {t.avatar}
        </div>
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-tight">{t.name}</h4>
          <p className="text-xs text-[var(--text-muted)] font-mono">{t.role}</p>
        </div>
      </div>
    </div>
  );
};
