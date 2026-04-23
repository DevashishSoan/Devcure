"use client";

import React from "react";
import { motion } from "framer-motion";

export const Metrics = () => {
  const stats = [
    { 
      value: "82", 
      unit: "%", 
      label: "Autonomous resolution rate", 
      sub: "Verified patches merged automatically",
      span: "md:col-span-6"
    },
    { 
      value: "<4", 
      unit: "m", 
      label: "Avg time to fix", 
      sub: "From detection to verified PR",
      span: "md:col-span-6"
    },
    { 
      value: "0", 
      unit: "", 
      label: "New regressions", 
      sub: "In 12,000+ repairs",
      span: "md:col-span-4"
    },
    { 
      value: "80", 
      unit: "%", 
      label: "Time saved", 
      sub: "Average engineering time gain",
      span: "md:col-span-8"
    }
  ];

  return (
    <section className="py-32 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[280px]">
        {stats.map((stat, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: i * 0.1 }}
            className={`cellular-cell rounded-[40px] p-12 flex flex-col justify-center ${stat.span}`}
            style={{
              borderRadius: i % 2 === 0 
                ? "40% 60% 70% 30% / 50% 50% 50% 50%" 
                : "60% 40% 30% 70% / 50% 50% 50% 50%"
            }}
          >
            <div className="mb-4">
              <span className="text-7xl font-bold font-mono tracking-tighter text-white">
                {stat.value}
              </span>
              <span className="text-4xl font-bold font-mono text-[#0891B2]">
                {stat.unit}
              </span>
            </div>
            <h4 className="text-lg font-medium text-neural-secondary mb-1">
              {stat.label}
            </h4>
            <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.2em]">
              {stat.sub}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
