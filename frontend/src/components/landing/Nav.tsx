"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const Nav = () => {
  return (
    <nav className="fixed top-0 left-0 w-full h-[64px] z-50 flex items-center justify-between px-6 border-b border-[var(--border)] bg-[rgba(4,5,8,0.7)] backdrop-blur-xl">
      {/* Left: Logo */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--acid)] to-[var(--plasma)] flex items-center justify-center font-bold text-[var(--void)] text-sm">
          DC
        </div>
        <span className="text-xl font-bold font-[var(--font-display)] text-[var(--text-primary)]">
          DevCure
        </span>
      </div>

      {/* Center: Links */}
      <div className="hidden md:flex items-center gap-8">
        {["How it works", "Features", "Pricing", "Docs", "Blog"].map((link) => (
          <Link
            key={link}
            href={`#${link.toLowerCase().replace(/ /g, "-")}`}
            className="text-sm font-[var(--font-body)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors px-3 py-1.5 rounded-md hover:bg-white/[0.04]"
          >
            {link}
          </Link>
        ))}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-6">
        <Link
          href="/login"
          className="text-sm font-[var(--font-body)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          Sign in
        </Link>
        <Link
          href="/signup"
          className="group flex items-center gap-2 px-5 py-[9px] bg-[var(--acid)] text-[var(--void)] rounded-lg font-bold font-[var(--font-display)] text-sm transition-transform hover:-translate-y-0.5"
        >
          Start free
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </nav>
  );
};
