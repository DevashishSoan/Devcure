"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

const companies = [
  { name: "Stripe" },
  { name: "Vercel" },
  { name: "Linear" },
  { name: "Supabase" },
  { name: "Railway" },
  { name: "PlanetScale" },
  { name: "Render" },
  { name: "Fly.io" },
];

export const LogosStrip = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className="py-24 overflow-hidden border-y border-white/5">
      <div className="text-center mb-16">
        <span className="text-[11px] font-mono text-neural-secondary uppercase tracking-[0.4em] font-bold">
          Trusted by high-stakes engineering teams
        </span>
      </div>

      <div 
        className="relative flex overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <motion.div 
          animate={{ x: [0, -1000] }}
          transition={{ 
            duration: isHovered ? 15 : 30, // Speed bump effect
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="flex gap-20 items-center whitespace-nowrap px-10"
        >
          {[...companies, ...companies].map((company, i) => (
            <span key={i} className="text-3xl font-bold tracking-tighter text-white/40 hover:text-white transition-opacity duration-300 cursor-default font-display">
              {company.name}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
