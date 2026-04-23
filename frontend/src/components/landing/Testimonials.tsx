"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Hakan Redzep",
    role: "Founding Engineer @ Vellum",
    content: "The first AI agent that actually gets the context of our mono-repo. The patches it generates are cleaner than most human devs.",
    avatar: "HR"
  },
  {
    name: "Sarah Chen",
    role: "Staff SRE @ Linear",
    content: "We plugged DevCure into our CI and it caught a race condition in prod that had been haunting us for weeks. Surgical and precise.",
    avatar: "SC"
  },
  {
    name: "Marcus Thorne",
    role: "Head of Infrastructure @ Scale",
    content: "DevCure is the security blanket our senior devs didn't know they needed. MTTR has dropped by 60% since implementation.",
    avatar: "MT"
  }
];

export const Testimonials = () => {
  return (
    <section className="py-32 px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="mb-24 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[clamp(44px,6vw,84px)] font-bold tracking-tighter leading-[0.9] text-shimmer"
          >
            Vetted by the <br />
            synthetic elite.
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, filter: "blur(10px)", y: 20 }}
              whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
              className="cellular-cell p-10 flex flex-col justify-between h-[400px]"
              style={{
                borderRadius: i % 2 === 0 
                  ? "40% 60% 30% 70% / 50% 50% 50% 50%" 
                  : "60% 40% 70% 30% / 50% 50% 50% 50%"
              }}
            >
              <div className="relative z-10">
                <div className="flex gap-1 mb-8">
                  {[...Array(5)].map((_, idx) => (
                    <Star key={idx} size={12} className="fill-[#0891B2] text-[#0891B2]" />
                  ))}
                </div>

                <p className="text-neural-secondary text-lg leading-relaxed mb-10">
                  "{t.content}"
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#0891B2]/20 flex items-center justify-center font-bold text-[#0891B2] border border-[#0891B2]/20">
                  {t.avatar}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white tracking-tight font-display">{t.name}</h4>
                  <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
