"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Zap, 
  Shield, 
  Terminal as TerminalIcon, 
  Cpu, 
  RefreshCw, 
  Lock 
} from "lucide-react";

const CellularCard = ({ 
  children, 
  className = "", 
  delay = 0 
}: { 
  children: React.ReactNode, 
  className?: string, 
  delay?: number 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(20px)", y: 40 }}
      whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.02 }}
      className={`cellular-cell rounded-[2rem] overflow-hidden p-10 group ${className}`}
      style={{
        // Simulating organic geometry with slightly different border radius on each corner
        borderRadius: "24% 76% 70% 30% / 30% 30% 70% 70%",
      }}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-br from-[#0891B2]/5 to-transparent" />
      <div className="relative z-10 h-full flex flex-col justify-between">
        {children}
      </div>
    </motion.div>
  );
};

export const FeaturesGrid = () => {
  return (
    <section id="features" className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-24">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-[clamp(44px,6vw,84px)] font-bold tracking-tighter leading-[0.9] text-white"
          >
            Engineered for <br />
            <span className="text-neural-secondary">high-stakes code.</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[360px]">
          {/* Main Resolution Cell */}
          <CellularCard className="md:col-span-8 md:row-span-2 border-glow-animate">
            <div className="max-w-md">
              <div className="w-12 h-12 rounded-xl bg-[#0891B2]/10 flex items-center justify-center text-[#0891B2] mb-8">
                <Zap size={24} />
              </div>
              <h3 className="text-4xl font-semibold mb-4 text-white">Surgical patches.</h3>
              <p className="text-neural-secondary text-lg leading-relaxed">
                Our agent doesn't just suggest fixes; it reasons within a secure, logic-isolated sandbox to produce production-ready diffs.
              </p>
            </div>
            
            {/* Terminal Preview */}
            <div className="mt-12 bg-black/40 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-xl">
               <div className="flex items-center gap-1.5 px-4 py-3 bg-white/5">
                 <div className="w-2 h-2 rounded-full bg-white/10" />
                 <div className="w-2 h-2 rounded-full bg-white/10" />
                 <span className="ml-2 text-[10px] font-mono text-zinc-600 uppercase tracking-widest">agent_v4.0.2</span>
               </div>
               <div className="p-6 font-mono text-xs text-[#0891B2]">
                 <p>{">"} INITIALIZING REASONING_CORE...</p>
                 <p className="opacity-60">{">"} SCANNING REPO FOR ANOMALIES...</p>
                 <p className="text-white mt-2">{">"} RESOLVED: auth_middleware.go:42</p>
                 <p>{">"} APPLYING NEURAL_PATCH...</p>
               </div>
            </div>
          </CellularCard>

          {/* Compliance Cell */}
          <CellularCard className="md:col-span-4 md:row-span-1" delay={0.2}>
            <div className="w-10 h-10 rounded-lg bg-[#0891B2]/10 flex items-center justify-center text-[#0891B2] mb-6">
              <Shield size={20} />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-white mb-2">Zero-Trust.</h3>
              <p className="text-neural-secondary text-sm leading-relaxed">
                SOC2 compliant sandboxes for every repair cycle. Your code never leaves the perimeter.
              </p>
            </div>
          </CellularCard>

          {/* Speed Cell */}
          <CellularCard className="md:col-span-4 md:row-span-1" delay={0.4}>
            <div className="w-10 h-10 rounded-lg bg-[#0891B2]/10 flex items-center justify-center text-[#0891B2] mb-6">
              <RefreshCw size={20} />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-white mb-2">Real-time Fix.</h3>
              <p className="text-neural-secondary text-sm leading-relaxed">
                From detection to verified pull request in under 4 minutes. Stop the bleed instantly.
              </p>
            </div>
          </CellularCard>

          {/* Infrastructure Section: Enterprise Integrity */}
          <div className="md:col-span-12 mt-12">
            <CellularCard className="!p-0 overflow-hidden" delay={0.6}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center p-10 md:p-16">
                 <div className="max-w-xl">
                    <div className="text-[10px] font-mono text-[#0891B2] uppercase tracking-[0.4em] mb-6 font-bold">Infrastructure</div>
                    <h3 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tighter leading-tight font-display">
                      Enterprise-grade <br />
                      synthetic integrity.
                    </h3>
                    <p className="text-neural-secondary text-lg leading-relaxed">
                      The engine trusted by high-frequency trading firms and core infrastructure teams globally. 
                      Isolated execution pods ensure zero data leakage.
                    </p>
                 </div>

                 {/* Constrained Terminal preview */}
                 <div className="w-full max-w-lg ml-auto">
                    <div className="bg-black/60 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-2xl shadow-2xl">
                       <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/5">
                         <div className="flex gap-1.5">
                           <div className="w-2 h-2 rounded-full bg-white/10" />
                           <div className="w-2 h-2 rounded-full bg-white/10" />
                         </div>
                         <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">trust_verification_node</span>
                       </div>
                       <div className="p-6 font-mono text-[11px] space-y-2">
                         <p className="text-zinc-500">{"["}OK{"]"} verifying_soc2_perimeter...</p>
                         <p className="text-zinc-500">{"["}OK{"]"} rls_policy_check_passed.</p>
                         <p className="text-[#0891B2]">{"["}OK{"]"} pod_integrity_verified.</p>
                       </div>
                    </div>
                 </div>
              </div>
            </CellularCard>
          </div>
        </div>
      </div>
    </section>
  );
};
