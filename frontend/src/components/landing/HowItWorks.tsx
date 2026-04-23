"use client";

import React from "react";
import { motion } from "framer-motion";
import { GitPullRequest, Search, Cpu, CheckCircle2 } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Neural Detection",
    desc: "DevCure receives a push event. HMAC-verified, zero latency. The network awakens.",
    icon: <Search className="w-5 h-5" />
  },
  {
    number: "02",
    title: "Logic Sandbox",
    desc: "Targeted unit tests are generated and executed in a secure, isolated pod.",
    icon: <Cpu className="w-5 h-5" />
  },
  {
    number: "03",
    title: "Surgical Repair",
    desc: "The agent identifies the root cause and writes a minimal, safe patch.",
    icon: <CheckCircle2 className="w-5 h-5" />
  },
  {
    number: "04",
    title: "Auto-Verification",
    desc: "Once verified across the entire suite, a clean Pull Request is opened.",
    icon: <GitPullRequest className="w-5 h-5" />
  }
];

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-24 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[clamp(44px,6vw,84px)] font-bold tracking-tighter leading-[0.9] text-shimmer mb-6"
          >
            Organic workflow. <br />
            Synthetic precision.
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
          {steps.map((step, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, filter: "blur(10px)", scale: 0.95 }}
              whileInView={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
              className="cellular-cell p-10 flex flex-col justify-between h-[320px]"
              style={{
                borderRadius: i % 2 === 0 
                  ? "30% 70% 70% 30% / 40% 40% 60% 60%" 
                  : "70% 30% 30% 70% / 40% 40% 60% 60%"
              }}
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#0891B2]/10 text-[#0891B2] flex items-center justify-center font-bold text-lg">
                  {step.icon}
                </div>
                <div className="text-[11px] font-mono text-zinc-600 uppercase tracking-[0.3em]">Phase {step.number}</div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-4 tracking-tight font-display">{step.title}</h3>
                <p className="text-neural-secondary font-medium leading-relaxed max-w-sm">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Live Terminal Log */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24 max-w-4xl mx-auto"
        >
          <div className="cellular-cell rounded-[40px] overflow-hidden p-1 border-white/5">
            <div className="flex items-center justify-between px-6 py-4 bg-white/5 border-b border-white/5">
              <div className="flex gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
              </div>
              <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">neural_node_log_v4</div>
              <div className="w-12" />
            </div>
            
            <div className="p-8 font-mono text-[13px] leading-relaxed h-[400px] overflow-y-auto bg-black/40">
              <div className="space-y-3">
                <p className="text-zinc-600">[{new Date().toISOString().split('T')[1].split('.')[0]}] <span className="text-[#0891B2]">SYSTEM</span> initializing_agents...</p>
                <p className="text-[#0891B2]">[SCAN] pushing_logic_to_sandbox...</p>
                <p className="text-white">{">>"} 1 FAILED TEST: integration/auth_test.go:112</p>
                <p className="text-zinc-600">[{new Date().toISOString().split('T')[1].split('.')[0]}] <span className="text-neural-secondary">AGENT</span> analyzing_call_stack...</p>
                <p className="text-[#0891B2]">[DIAG] identifying_null_dereference...</p>
                <p className="text-white">{">>"} Generating surgical patch #82A...</p>
                <p className="text-[#0891B2]">[FIX] patch_applied_successfully.</p>
                <p className="text-white">{">>"} Rerunning suite: 42 PASSED.</p>
                <div className="w-2 h-4 bg-[#0891B2] animate-pulse inline-block" />
              </div>
              
              {/* Floating PR Alert */}
              <motion.div 
                animate={{ x: [0, 5, 0], y: [0, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="mt-12 p-6 rounded-2xl bg-[#0891B2]/5 border border-[#0891B2]/20 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#0891B2]/20 flex items-center justify-center text-[#0891B2]">
                    <GitPullRequest size={20} />
                  </div>
                  <div>
                    <div className="text-white font-bold text-sm">PR #482: Fix Null Pointer</div>
                    <div className="text-xs text-neural-secondary">Verified across 42 scenarios.</div>
                  </div>
                </div>
                <div className="px-3 py-1 rounded bg-[#0891B2]/20 text-[#0891B2] text-[10px] font-bold uppercase tracking-widest">Ready</div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
