"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "teal";
  size?: "sm" | "md" | "lg" | "hero";
  icon?: LucideIcon;
  isLoading?: boolean;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  isLoading,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 active:scale-[0.96] disabled:opacity-50 disabled:pointer-events-none rounded-[12px]";
  
  const variants = {
    primary: "bg-accent-purple text-white hover:brightness-110 hover:scale-[1.02]",
    secondary: "bg-bg-surface border border-border-default text-white hover:bg-bg-hover hover:scale-[1.02]",
    ghost: "bg-transparent text-text-secondary hover:text-white hover:scale-[1.02]",
    danger: "bg-accent-red/10 border border-accent-red/20 text-accent-red hover:bg-accent-red/20",
    teal: "bg-accent-teal text-white hover:brightness-110 hover:scale-[1.02]",
  };

  const sizes = {
    sm: "px-4 py-2 text-[13px]",
    md: "px-6 py-3 text-[14px]",
    lg: "px-8 py-4 text-[16px]",
    hero: "px-10 h-[48px] text-[16px] rounded-[999px]", // Pill for hero style
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        Icon && <Icon size={size === "sm" ? 14 : 18} strokeWidth={1.5} />
      )}
      {children}
    </button>
  );
}
