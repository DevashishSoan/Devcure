"use client";

import React from "react";
import {
  Activity,
  FolderGit2,
  LayoutDashboard,
  Terminal,
  Settings,
  Shield,
  LogOut,
  Zap,
} from "lucide-react";
import { signOut } from "@/lib/api";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStats } from "@/hooks/useStats";

export default function Sidebar() {
  const pathname = usePathname();
  const { stats } = useStats();

  // Don't show sidebar on landing page or auth pages
  const isAuthPage = pathname?.startsWith("/auth");
  const isLandingPage = pathname === "/";
  if (isAuthPage || isLandingPage) return null;

  const navItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Neural Overview", href: "/dashboard" },
    { id: "repos", icon: FolderGit2, label: "Repositories", href: "/repos" },
    { id: "runs", icon: Activity, label: "Autonomous Runs", href: "/runs" },
    { id: "settings", icon: Settings, label: "Settings", href: "/settings" },
  ];

  return (
    <aside className="w-[280px] border-r border-white/5 bg-[#040508] p-8 flex flex-col gap-10 shrink-0 z-30">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-acid to-plasma flex items-center justify-center shadow-lg shadow-acid/20 group cursor-pointer transition-all duration-500 hover:rotate-[360deg]">
          <Shield className="text-void" size={24} />
        </div>
        <div>
          <span className="text-2xl font-black tracking-tighter text-white">DevCure</span>
          <p className="text-[9px] text-acid font-black tracking-[0.3em] -mt-1 uppercase">Proto-Agent</p>
        </div>
      </div>

      <nav className="flex flex-col gap-2">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-700 ml-4 mb-2">Network Control</p>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                isActive
                  ? "bg-white/5 text-white ring-1 ring-white/10"
                  : "text-slate-500 hover:text-white hover:bg-white/[0.02]"
              }`}
            >
              <item.icon
                size={18}
                className={
                  isActive
                    ? "text-acid"
                    : "text-slate-700 group-hover:text-acid/70 transition-colors"
                }
              />
              <span className="text-[13px] font-black uppercase tracking-widest">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-6">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-acid/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-acid/10 transition-colors" />
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-acid" />
              <p className="text-[10px] font-black text-white uppercase tracking-widest">Protocol α</p>
            </div>
            <span className="text-[8px] font-black px-2 py-0.5 rounded bg-acid/10 text-acid border border-acid/20">
              OPTIMIZED
            </span>
          </div>
          
          <div className="space-y-3">
             <div className="flex justify-between items-end">
               <p className="text-[10px] text-slate-500 uppercase font-black">Capacity</p>
               <p className="text-xs font-black text-white">{stats?.active_sandboxes || 0} <span className="text-slate-600">/ 200</span></p>
             </div>
             <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-acid shadow-[0_0_10px_rgba(0,255,136,0.3)] transition-all duration-1000"
                  style={{ width: `${((stats?.active_sandboxes || 0) / 200) * 100}%` }}
                />
             </div>
          </div>
        </div>

        {/* User Info / Logout */}
        <div className="pt-6 border-t border-white/5">
           <button 
             onClick={() => signOut()}
             className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-red-500 hover:bg-red-500/5 transition-all duration-300 group"
           >
             <LogOut size={18} className="text-slate-700 group-hover:text-red-500 animate-pulse" />
             <span className="text-[11px] font-black uppercase tracking-widest">Terminate Session</span>
           </button>
        </div>
      </div>
    </aside>
  );
}
