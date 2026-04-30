"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export const Nav = () => {
  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 w-full h-[72px] z-50 flex items-center justify-center bg-[#020617]/80 backdrop-blur-md border-b border-white/5"
    >
      <div className="w-full max-w-7xl px-6 flex items-center justify-between">
        {/* Left: Brand */}
        <Link href="/" className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
          <img 
            src="/logo.png" 
            alt="DevCure Logo" 
            className="w-9 h-9 object-contain brightness-125 rounded-lg"
          />
          <span className="text-[17px] font-bold tracking-tight text-white font-display mt-0.5">
            DevCure
          </span>
        </Link>

        {/* Center: Logic */}
        <div className="hidden md:flex items-center gap-1">
          {["Features", "Pricing", "Docs"].map((link) => (
            <Link
              key={link}
              href={`#${link.toLowerCase()}`}
              className="text-[12px] font-medium text-neural-secondary hover:text-white transition-colors px-4 py-1.5 rounded-full"
            >
              {link}
            </Link>
          ))}
        </div>

        {/* Right: Action */}
        <div className="flex items-center gap-4">
          <Link
            href="/signup"
            className="px-5 py-1.5 bg-[#0891B2] text-white rounded-full font-semibold text-[12px] transition-all hover:scale-105 active:scale-95 font-display shadow-[0_0_20px_rgba(8,145,178,0.3)]"
          >
            Access Beta
          </Link>
        </div>
      </div>
    </motion.nav>
  );
};
