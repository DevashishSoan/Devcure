"use client";

import React from "react";

interface MarqueeProps {
  children: React.ReactNode;
  direction?: "left" | "right";
  speed?: number;
  pauseOnHover?: boolean;
}

export function Marquee({ 
  children, 
  direction = "left", 
  speed = 40,
  pauseOnHover = true 
}: MarqueeProps) {
  return (
    <div className="flex overflow-hidden select-none group">
      <div 
        className={`flex ${direction === "left" ? "animate-marquee" : "animate-marquee-reverse"}`}
        style={{ animationDuration: `${speed}s`, animationPlayState: pauseOnHover ? "paused" : "running" }}
      >
        <div className="flex shrink-0 gap-16 px-8 items-center group-hover:pause-animation">
          {children}
          {children}
        </div>
        <div className="flex shrink-0 gap-16 px-8 items-center group-hover:pause-animation">
          {children}
          {children}
        </div>
      </div>
    </div>
  );
}
