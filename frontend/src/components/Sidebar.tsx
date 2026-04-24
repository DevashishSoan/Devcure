"use client";

import React from "react";
import {
  Activity,
  FolderGit2,
  LayoutDashboard,
  Settings,
  Shield,
  LogOut,
  Bell,
  Search,
  ChevronRight,
} from "lucide-react";
import { signOut } from "@/lib/api";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
    { id: "repos", icon: FolderGit2, label: "Repositories", href: "/repos" },
    { id: "runs", icon: Activity, label: "History", href: "/runs" },
    { id: "settings", icon: Settings, label: "Configuration", href: "/settings" },
  ];

  const isAuthPage = pathname?.startsWith("/auth");
  const isLandingPage = pathname === "/";
  if (isAuthPage || isLandingPage) return null;

  return (
    <aside className="w-64 h-full bg-[#020617] border-r border-white/5 flex flex-col z-50 relative">
      {/* Brand Header */}
      <div className="p-8 mb-4">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="DevCure" className="w-8 h-8 object-contain" />
          <span className="text-lg font-bold tracking-tighter text-white font-display">DevCure</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        <div className="px-4 mb-6">
           <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em]">Core_Protocols</span>
        </div>
        
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                isActive
                  ? "text-[#0891B2]"
                  : "text-zinc-500 hover:text-white"
              }`}
            >
              {isActive && (
                <motion.div 
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-gradient-to-r from-[#0891B2]/10 to-transparent"
                />
              )}
              
              <div className="flex items-center gap-4 relative z-10">
                <item.icon
                  size={18}
                  className={isActive ? "text-[#0891B2]" : "text-zinc-600 group-hover:text-zinc-400"}
                />
                <span className={`text-[13px] font-bold tracking-tight font-display ${isActive ? 'text-shimmer' : ''}`}>
                  {item.label}
                </span>
              </div>
              
              {isActive && (
                <div className="w-1 h-4 rounded-full bg-[#0891B2] shadow-[0_0_12px_#0891B2] relative z-10" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Status */}
      <div className="p-6 mt-auto">
        <div className="bg-zinc-950/40 backdrop-blur-xl rounded-[24px] p-5 border border-white/5 mb-6 group relative overflow-hidden">
           <div className="flex items-center justify-between mb-3">
             <p className="text-[10px] font-black text-[#0891B2] uppercase tracking-widest">Neural Load</p>
             <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
           </div>
           <p className="text-[12px] font-bold text-zinc-300 font-mono tracking-tight">System_Active</p>
           <div className="mt-4 h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "82%" }}
                className="h-full bg-[#0891B2] shadow-[0_0_12px_#0891B2]" 
              />
           </div>
        </div>

        <button 
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-zinc-600 hover:text-white hover:bg-rose-500/5 hover:text-rose-400 transition-all text-xs font-bold font-display group border border-transparent hover:border-rose-500/10"
        >
          <LogOut size={16} className="transition-transform group-hover:-translate-x-1" />
          <span>TERMINATION</span>
        </button>
      </div>
    </aside>
  );
}
