"use client";

import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "warning" | "error" | "default" | "running";
  className?: string;
}

export function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  const variants = {
    success: "bg-success/10 text-success border-success/20",
    warning: "bg-warning/10 text-warning border-warning/20",
    error: "bg-error/10 text-error border-error/20",
    running: "bg-brand-indigo/10 text-brand-indigo border-brand-indigo/20 animate-pulse",
    default: "bg-white/5 text-slate-400 border-white/10",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-sm text-[11px] font-bold border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
