"use client";

import React, { useRef, useState } from "react";
import { motion, useSpring, useMotionValue, useTransform } from "framer-motion";

export function MagneticCard({ children, className = "", delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const springConfig = { damping: 20, stiffness: 150, mass: 0.5 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Max 5px movement as requested
    const distanceX = (event.clientX - centerX) * 0.05;
    const distanceY = (event.clientY - centerY) * 0.05;
    
    x.set(Math.min(Math.max(distanceX, -5), 5));
    y.set(Math.min(Math.max(distanceY, -5), 5));
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, scale: 0.98, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{ x: springX, y: springY }}
      className={`bg-zinc-950/60 backdrop-blur-2xl border border-white/5 rounded-[32px] p-8 shadow-2xl relative overflow-hidden group ${className}`}
    >
      {children}
    </motion.div>
  );
}
