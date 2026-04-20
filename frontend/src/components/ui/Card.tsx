"use client";

import React from "react";

interface CardProps {
  children: React.ReactNode;
  variant?: "flat" | "elevated" | "hover";
  className?: string;
  onClick?: () => void;
  radius?: "lg" | "xl";
}

export function Card({ 
  children, 
  variant = "flat", 
  radius = "lg",
  className = "", 
  onClick 
}: CardProps) {
  const baseStyles = "transition-all duration-300 border border-border-default overflow-hidden";
  
  const variants = {
    flat: "bg-bg-surface",
    elevated: "bg-bg-elevated",
    hover: "bg-bg-surface hover:bg-bg-hover hover:border-border-active hover:scale-[1.01]",
  };

  const radii = {
    lg: "rounded-[16px]",
    xl: "rounded-[24px]",
  };

  return (
    <div 
      className={`${baseStyles} ${variants[variant]} ${radii[radius]} ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
