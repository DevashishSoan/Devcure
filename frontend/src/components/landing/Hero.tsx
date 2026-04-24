"use client";

import React, { useState, useEffect } from "react";
import { motion, useSpring, useMotionValue, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { NeuralWeb } from "./NeuralWeb";
import { CureGlare } from "./CureGlare";
import { TryDemoModal } from "./DemoSection";

const ScrambleText = ({ text }: { text: string }) => {
  const [displayText, setDisplayText] = useState("");
  const chars = "!<>-_\\/[]{}—=+*^?#________";

  useEffect(() => {
    let frame = 0;
    const totalFrames = 60;
    const timer = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      
      const scrambled = text
        .split("")
        .map((char, index) => {
          if (progress > (index / text.length) + 0.1 || char === " ") {
            return char;
          }
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join("");

      setDisplayText(scrambled);
      if (frame >= totalFrames) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, [text]);

  return <span>{displayText}</span>;
};

const MagneticButton = ({ children, primary = false, onClick }: { children: React.ReactNode, primary?: boolean, onClick?: () => void }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * 0.3);
    y.set((e.clientY - centerY) * 0.3);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative group"
    >
      <button
        onClick={onClick}
        className={`
          relative px-10 py-4 rounded-full font-semibold text-sm transition-all overflow-hidden
          ${primary ? 'bg-white text-black' : 'bg-transparent border border-white/10 text-white hover:border-white/30'}
        `}
      >
        {primary && (
          <div className="absolute inset-0 bg-[#0891B2] scale-0 group-hover:scale-150 transition-transform duration-700 rounded-full origin-center opacity-0 group-hover:opacity-100 mix-blend-screen" />
        )}
        <span className="relative z-10">{children}</span>
      </button>
    </motion.div>
  );
};

const STAT_BADGES = [
  { label: "Tests Healed", value: "50k+" },
  { label: "Avg MTTR", value: "47s" },
  { label: "Success Rate", value: "91%" },
];

export const Hero = () => {
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 px-6 overflow-hidden">
      <NeuralWeb />
      <CureGlare />
      <div className="holographic-scan" />

      <div className="relative z-10 text-center max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="mb-8"
        >
          <span className="text-[12px] font-mono uppercase tracking-[0.4em] text-neural-secondary">
            [ Neural Engine v4.0.2 · MIT Open Source ]
          </span>
        </motion.div>

        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-10 leading-[0.9] text-shimmer">
          <ScrambleText text="Your code breaks." /><br />
          <span className="opacity-100">We fix it.</span>
        </h1>

        <motion.p
          initial={{ opacity: 0, filter: "blur(10px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ delay: 0.8, duration: 1 }}
          className="text-neural-secondary text-lg md:text-xl max-w-2xl mx-auto mb-6 font-medium leading-relaxed"
        >
          DevCure autonomously diagnoses failing CI tests, generates surgical code patches,
          and opens a verified PR — with a full reasoning trace your team can audit.
        </motion.p>

        {/* Social proof stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="flex items-center justify-center gap-6 mb-12 flex-wrap"
        >
          {STAT_BADGES.map((s) => (
            <div key={s.label} className="flex items-center gap-2">
              <span className="text-white font-bold font-mono">{s.value}</span>
              <span className="text-zinc-600 text-sm">{s.label}</span>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, type: "spring", stiffness: 100, damping: 15 }}
          className="flex flex-wrap items-center justify-center gap-6"
        >
          <Link href="/signup">
            <MagneticButton primary>Start Building Free</MagneticButton>
          </Link>
          <MagneticButton onClick={() => setIsDemoOpen(true)}>
            ▶ Watch Live Demo
          </MagneticButton>
        </motion.div>

        {/* Platform badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="flex items-center justify-center gap-3 mt-10 flex-wrap"
        >
          {[
            { label: "Python 3.12", color: "text-blue-400" },
            { label: "Next.js 16", color: "text-white" },
            { label: "LangGraph", color: "text-indigo-400" },
            { label: "MIT License", color: "text-emerald-400" },
            { label: "pytest · Jest · Vitest", color: "text-[#0891B2]" },
          ].map((b) => (
            <span
              key={b.label}
              className={`text-[10px] font-mono px-3 py-1 rounded-full border border-white/5 bg-white/[0.03] ${b.color}`}
            >
              {b.label}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Decorative Parallax Orbs */}
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute bottom-20 left-20 w-32 h-32 rounded-full bg-[#0891B2]/5 blur-3xl"
      />
      <motion.div
        animate={{ y: [0, 30, 0] }}
        transition={{ duration: 12, repeat: Infinity }}
        className="absolute top-40 right-20 w-48 h-48 rounded-full bg-[#0891B2]/5 blur-3xl"
      />

      {/* Demo Modal */}
      <AnimatePresence>
        {isDemoOpen && <TryDemoModal onClose={() => setIsDemoOpen(false)} />}
      </AnimatePresence>
    </section>
  );
};
