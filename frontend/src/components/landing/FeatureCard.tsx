"use client";

import React from "react";
import { Card } from "@/components/ui/Card";

interface FeatureCardProps {
  label: string;
  title: string;
  description: string;
  children: React.ReactNode;
  reversed?: boolean;
}

export function FeatureCard({ label, title, description, children, reversed }: FeatureCardProps) {
  return (
    <div className={`flex flex-col ${reversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-16 lg:gap-24 group visible`}>
      <div className="flex-1 space-y-8 stagger-in visible">
        <div className="flex items-center gap-4">
          <div className="w-12 h-[1px] bg-accent-primary/50" />
          <span className="text-[12px] font-mono text-accent-primary uppercase tracking-[0.4em] font-black">
            {label}
          </span>
        </div>
        <h3 className="text-[42px] lg:text-[56px] font-display leading-[0.95] text-white tracking-tight">
          {title}
        </h3>
        <p className="text-[18px] text-text-secondary leading-relaxed max-w-[480px] font-light">
          {description}
        </p>
      </div>

      <div className="flex-1 w-full flex justify-center perspective-1000">
        <div className="
          prism-border rounded-[4px] p-2 w-full max-w-[520px] 
          transition-transform duration-700 ease-out preserve-3d
          group-hover:rotate-x-2 group-hover:rotate-y-[-2deg]
          shadow-[0_20px_50px_rgba(0,0,0,0.5)]
        ">
          <div className="relative aspect-video rounded-[2px] overflow-hidden bg-bg-base flex items-center justify-center p-8 bg-[radial-gradient(circle_at_var(--cursor-x)_var(--cursor-y),rgba(0,255,156,0.02)_0%,transparent_70%)]">
            <div className="relative z-10 transition-transform duration-500 group-hover:scale-[1.05]">
              {children}
            </div>
            
            {/* ─── Prism Grid Overlay ─── */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                backgroundSize: '32px 32px'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
