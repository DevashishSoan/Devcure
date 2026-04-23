"use client";

import React from "react";
import { motion } from "framer-motion";

export const CureGlare = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Cyan Glare 1 */}
      <motion.div
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          opacity: [0.1, 0.2, 0.1],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#0891B2] blur-[150px]"
      />

      {/* Cyan Glare 2 */}
      <motion.div
        animate={{
          x: [0, -120, 0],
          y: [0, 80, 0],
          opacity: [0.05, 0.15, 0.05],
          scale: [1.2, 1, 1.2],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#0891B2] blur-[120px]"
      />

      {/* Subtle Refraction Orb */}
      <motion.div
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          duration: 60,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full"
      >
        <div className="absolute top-[20%] left-[30%] w-[30%] h-[30%] rounded-full bg-white/5 blur-[100px]" />
      </motion.div>
    </div>
  );
};
