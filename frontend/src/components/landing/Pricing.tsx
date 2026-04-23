"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
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
  }, []);

  const plans = [
    {
      name: "Free",
      price: "0",
      desc: "Perfect side projects.",
      features: ["1 private repository", "Unlimited public repos", "Standard priority"],
      cta: "Start free",
      featured: variant === 'B'
    },
    {
      name: "Developer",
      price: isAnnual ? "29" : "39",
      desc: "The professional choice.",
      features: ["5 private repositories", "Surgical diff mapping", "Priority queue", "Slack integration"],
      cta: "Get started",
      featured: variant === 'A'
    },
    {
      name: "Team",
      price: isAnnual ? "99" : "119",
      desc: "High scale repair.",
      features: ["Unlimited repositories", "vVisor isolated pods", "SAML SSO / Auth", "24/7 Priority support"],
      cta: "Contact sales",
      featured: false
    }
  ];

  return (
    <section id="pricing" className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-24 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[clamp(44px,6vw,84px)] font-bold tracking-tighter leading-[0.9] text-shimmer mb-12"
          >
            The right plan <br />
            for every pace.
          </motion.h2>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-6">
            <span className={`text-sm font-medium transition-colors ${!isAnnual ? 'text-white' : 'text-neural-secondary'}`}>Monthly</span>
            <button 
              onClick={() => setIsAnnual(!isAnnual)}
              className="w-12 h-6 rounded-full bg-zinc-900 border border-white/10 relative p-1 transition-all"
            >
              <motion.div 
                animate={{ x: isAnnual ? 24 : 0 }}
                className="w-4 h-4 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" 
              />
            </button>
            <span className={`text-sm font-medium transition-colors ${isAnnual ? 'text-white' : 'text-neural-secondary'}`}>Annual</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan, i) => (
            <PricingCard key={i} plan={plan} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

const PricingCard = ({ plan, i }: { plan: any, i: number }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: i * 0.1 }}
      className={`relative bg-zinc-950/40 backdrop-blur-md border rounded-[2rem] p-10 flex flex-col justify-between transition-all duration-500 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] ${plan.featured ? 'border-cyan-500/30' : 'border-white/10'}`}
    >
      {plan.featured && (
        <div className="absolute top-0 right-10 -translate-y-1/2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
          Most Popular
        </div>
      )}

      <div>
        <h3 className="text-xl font-bold text-white mb-2 font-display">{plan.name}</h3>
        <p className="text-neural-secondary text-sm mb-10">{plan.desc}</p>
        
        <div className="flex items-baseline gap-1 mb-12">
          <span className="text-6xl font-bold text-white tracking-tighter font-mono">{plan.price}</span>
          <span className="text-lg text-[#0891B2] font-medium font-mono">/mo</span>
        </div>

        <ul className="space-y-4 mb-12">
          {plan.features.map((feature: string, idx: number) => (
            <li key={idx} className="flex items-center gap-3 text-sm font-medium text-neural-secondary">
              <Check size={14} className="text-[#0891B2]" />
              {feature}
            </li>
          ))}
        </ul>
      </div>

      <button className={`w-full py-4 rounded-full font-semibold text-sm transition-all overflow-hidden relative group ${plan.featured ? 'bg-[#0891B2] text-white' : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'}`}>
        <span className="relative z-10">{plan.cta}</span>
      </button>
    </motion.div>
  );
};
