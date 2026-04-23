"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export const CTASection = () => {
  return (
    <section className="py-64 flex flex-col items-center justify-center text-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-[#0891B2]/5 to-transparent pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        className="relative z-10"
      >
        <h2 className="text-[clamp(44px,7vw,110px)] font-bold leading-[0.85] mb-12 font-display text-shimmer tracking-tighter">
          Stop debugging. <br />
          <span>Start curing.</span>
        </h2>
        
        <p className="text-neural-secondary text-lg mb-16 max-w-xl mx-auto font-medium">
          Join 10,000+ teams building the future of autonomous software. <br />
          The agent is ready.
        </p>
        
        <div className="flex flex-wrap items-center justify-center gap-8">
          <Link href="/signup">
            <button className="px-12 py-5 bg-white text-black rounded-full font-bold text-lg transition-all hover:scale-110 active:scale-95 shadow-[0_20px_40px_rgba(255,255,255,0.1)] group overflow-hidden relative">
              <div className="absolute inset-0 bg-[#0891B2] scale-0 group-hover:scale-150 transition-transform duration-700 rounded-full origin-center opacity-0 group-hover:opacity-100 mix-blend-screen" />
              <span className="relative z-10">Deploy Agent Now</span>
            </button>
          </Link>
          <Link href="/docs">
             <button className="px-10 py-4 border border-white/20 text-white rounded-full font-bold text-lg transition-all hover:bg-white/5">
               Read documentation
             </button>
          </Link>
        </div>
      </motion.div>
    </section>
  );
};
