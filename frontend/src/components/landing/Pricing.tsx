"use client";

import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { use3DTilt } from "@/hooks/use3DTilt";
import { getVariant, trackABEvent, trackConversion } from "@/lib/ab-testing";
import { getAnonymousId } from "@/lib/anonymous-id";

export const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(true);
  const [variant, setVariant] = useState<'A' | 'B'>('A');
  const [anonymousId, setAnonymousId] = useState<string>('');

  useEffect(() => {
    const anonId = getAnonymousId();
    const v = getVariant('pricing-v1', anonId);
    setVariant(v);
    setAnonymousId(anonId);

    trackABEvent({
      experimentId: 'pricing-v1',
      variant: v,
      event: 'impression',
      anonymousId: anonId,
      timestamp: new Date()
    });
  }, []);

  const handleCTAClick = (planName: string) => {
    trackABEvent({
      experimentId: 'pricing-v1',
      variant: variant,
      event: 'cta_click',
      anonymousId: anonymousId,
      metadata: { plan: planName },
      timestamp: new Date()
    });
    
    if (planName === 'Free') {
        trackConversion('pricing-v1', variant, anonymousId, 'free_plan_signup');
    }
  };

  const plans = [
    {
      name: "Free",
      price: "0",
      desc: "Perfect for open source & side projects.",
      features: ["1 private repository", "Unlimited public repos", "Standard repair priority", "Community support"],
      cta: "Start for free",
      featured: variant === 'B',
      badge: variant === 'B' ? "Recommended for Side Projects" : null
    },
    {
      name: "Developer",
      price: isAnnual ? "29" : "39",
      desc: "The professional choice for serious builders.",
      features: ["5 private repositories", "Surgical diff mapping", "Priority repair queue", "Custom safety gates", "Slack integration"],
      cta: "Get started",
      featured: variant === 'A',
      badge: variant === 'A' ? "Most popular" : null
    },
    {
      name: "Team",
      price: isAnnual ? "99" : "119",
      desc: "High scale repair for growing organizations.",
      features: ["Unlimited repositories", "vVisor isolated pods", "SAML SSO / Auth", "Custom HMAC verification", "24/7 Priority support"],
      cta: "Contact sales",
      featured: false
    }
  ];

  return (
    <section id="pricing" className="section-padding bg-[var(--surface-1)]">
      <div className="reveal text-center mb-16 px-6">
        <h2 className="text-3xl md:text-4xl font-bold font-[var(--font-display)] mb-8">
          The right plan for every pace.
        </h2>

        {/* Toggle with 3D sliding effect */}
        <div className="flex items-center justify-center gap-4">
          <span className={`text-sm font-medium transition-colors ${!isAnnual ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>Monthly</span>
          <button 
            onClick={() => setIsAnnual(!isAnnual)}
            className="w-14 h-7 rounded-full bg-[var(--surface-3)] border border-[var(--border)] relative p-1 transition-all hover:border-[var(--border-bright)]"
          >
            <div 
              className={`w-5 h-5 rounded-full bg-[var(--acid)] transition-all duration-300 shadow-[0_0_15px_rgba(0,255,136,0.5)] ${isAnnual ? 'translate-x-[28px]' : 'translate-x-0'}`} 
            />
          </button>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium transition-colors ${isAnnual ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>Annual</span>
            <span className="px-2 py-0.5 rounded-full bg-[var(--acid-dim)] text-[var(--acid)] text-[9px] font-bold uppercase ring-1 ring-[var(--acid)]/20">Save 25%</span>
          </div>
        </div>
      </div>

      <div className="reveal max-w-[1200px] mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {plans.map((plan, i) => (
          <PricingCard key={i} plan={plan} onCTAClick={() => handleCTAClick(plan.name)} />
        ))}
      </div>
    </section>
  );
};

const PricingCard = ({ plan, onCTAClick }: { plan: any, onCTAClick: () => void }) => {
  const { cardRef, style, parallaxOffset, onMouseMove, onMouseLeave } = use3DTilt({ 
    max: 10,
    scale: plan.featured ? 1.05 : 1
  });

  return (
    <div 
      ref={cardRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={`glass-card relative p-8 flex flex-col justify-between transition-all ${plan.featured ? 'border-[rgba(0,255,136,0.25)] z-20 shadow-[0_30px_60px_-15px_rgba(0,255,136,0.1)]' : 'z-10 bg-white/[0.01]'}`}
      style={{ 
        ...style,
        backgroundColor: plan.featured ? 'rgba(0,255,136,0.04)' : ''
      }}
    >
      {plan.badge && (
        <div 
          className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--acid)] text-[var(--void)] text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full whitespace-nowrap shadow-[0_5px_15px_rgba(0,255,136,0.4)] z-30"
          style={{ transform: `translateX(-50%) translateZ(30px) rotateX(${parallaxOffset.y * -0.5}deg)` }}
        >
          {plan.badge}
        </div>
      )}

      <div className="relative z-10" style={{ transform: `translateZ(20px) translateX(${parallaxOffset.x * 0.3}px)` }}>
        <h3 className="text-sm font-mono text-[var(--text-muted)] uppercase tracking-widest mb-4">{plan.name}</h3>
        <div className="flex items-baseline gap-1 mb-6">
          <span className="text-sm font-bold text-[var(--text-secondary)] -translate-y-4">$</span>
          <span className="text-5xl font-bold font-[var(--font-display)] text-white">{plan.price}</span>
          <span className="text-sm text-[var(--text-dim)]">/mo</span>
        </div>
        <p className="text-[var(--text-secondary)] text-sm font-light mb-8 h-10">
          {plan.desc}
        </p>

        <div className="space-y-4 mb-10">
          {plan.features.map((f: string, j: number) => (
            <div key={j} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded bg-[var(--acid-dim)] flex-shrink-0 flex items-center justify-center">
                <Check className="w-3 h-3 text-[var(--acid)]" />
              </div>
              <span className="text-sm text-[var(--text-secondary)] font-light">{f}</span>
            </div>
          ))}
        </div>
      </div>

      <button 
        onClick={onCTAClick}
        className={`w-full py-4 rounded-lg font-bold font-[var(--font-display)] text-sm transition-all relative z-20 ${plan.featured ? 'bg-[var(--acid)] text-[var(--void)] shadow-[0_10px_20px_-10px_rgba(0,255,136,0.5)] hover:shadow-[0_15px_25px_-5px_rgba(0,255,136,0.6)]' : 'bg-transparent border border-[var(--border-bright)] text-[var(--text-primary)] hover:bg-white/5'}`}
        style={{ transform: `translateZ(40px)` }}
      >
        {plan.cta}
      </button>
    </div>
  );
};
