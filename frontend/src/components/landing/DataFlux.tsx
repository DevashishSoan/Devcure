"use client";

import React from "react";

export function DataFlux() {
  return (
    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 hidden lg:block pointer-events-none z-0 overflow-hidden">
      <svg width="100%" height="24" viewBox="0 0 1200 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
        <path 
          d="M0 12H1200" 
          stroke="url(#data_gradient)" 
          strokeWidth="1" 
          strokeDasharray="4 12"
          className="animate-data-pulse"
        />
        <defs>
          <linearGradient id="data_gradient" x1="0" y1="12" x2="1200" y2="12" gradientUnits="userSpaceOnUse">
            <stop stopColor="#7C6AF7" stopOpacity="0" />
            <stop offset="0.5" stopColor="#7C6AF7" />
            <stop offset="1" stopColor="#7C6AF7" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
      
      <style jsx>{`
        @keyframes data-pulse {
          0% { stroke-dashoffset: 0; opacity: 0.2; }
          50% { opacity: 0.8; }
          100% { stroke-dashoffset: -100; opacity: 0.2; }
        }
        .animate-data-pulse {
          animation: data-pulse 10s linear infinite;
        }
      `}</style>
    </div>
  );
}
